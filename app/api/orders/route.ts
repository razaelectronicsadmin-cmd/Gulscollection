import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/email';

class OrderValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'OrderValidationError';
    this.statusCode = statusCode;
  }
}

// POST /api/orders – Guest checkout with atomic inventory decrement, delivery fee & promo calculation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      items,
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please provide all required customer and item details.' }, { status: 422 });
    }

    // Generate unique order number e.g. GUL-2026-98432
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GUL-${new Date().getFullYear()}-${randomSuffix}`;

    // Execute atomic inventory validation, stock decrement, and order creation in a single Prisma transaction
    const { newOrder, emailItems } = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: { productId: number; quantity: number; priceAtPurchase: number }[] = [];
      const emailItemsList: { name: string; quantity: number; price: number }[] = [];

      // 1. Validate items and compute subtotal
      for (const item of items) {
        const productId = parseInt(item.productId);
        if (isNaN(productId)) {
          throw new OrderValidationError(`Invalid product ID "${item.productId}".`, 400);
        }

        const qty = Math.max(1, parseInt(item.quantity) || 1);

        const product = await tx.product.findUnique({
          where: { id: productId },
          include: { category: true },
        });

        if (!product) {
          throw new OrderValidationError(`Product ID ${productId} not found.`, 404);
        }

        // Strict Out-of-Stock Check
        if (product.stockQuantity <= 0) {
          throw new OrderValidationError(
            `"${product.name}" is currently out of stock. Please remove it from your cart to proceed.`,
            400
          );
        }

        // Strict Insufficient Stock Check
        if (product.stockQuantity < qty) {
          throw new OrderValidationError(
            `Insufficient inventory for "${product.name}". Only ${product.stockQuantity} item(s) available in stock, but ${qty} requested.`,
            400
          );
        }

        // Atomically Decrement Inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: qty,
            },
          },
        });

        const price = Number(product.price);
        subtotal += price * qty;

        orderItemsData.push({
          productId: product.id,
          quantity: qty,
          priceAtPurchase: price,
        });

        emailItemsList.push({
          name: product.name,
          quantity: qty,
          price,
        });
      }

      // 2. Coupon Validation & Discount Calculation
      let discountAmount = 0;
      let appliedCouponCode: string | null = null;
      let hasFreeShippingCoupon = false;

      if (couponCode && typeof couponCode === 'string') {
        const cleanCode = couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({
          where: { code: cleanCode },
        });

        if (coupon && coupon.isActive) {
          const now = new Date();
          const isDateValid =
            (!coupon.startDate || now >= new Date(coupon.startDate)) &&
            (!coupon.endDate || now <= new Date(coupon.endDate));
          const isUsageValid = coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit;
          const isMinSpendValid = coupon.minOrderAmount === null || subtotal >= Number(coupon.minOrderAmount);

          if (isDateValid && isUsageValid && isMinSpendValid) {
            appliedCouponCode = coupon.code;
            const discountVal = Number(coupon.discountValue);

            if (coupon.discountType === 'PERCENTAGE') {
              let calculatedDiscount = (subtotal * discountVal) / 100;
              if (coupon.maxDiscount !== null && calculatedDiscount > Number(coupon.maxDiscount)) {
                calculatedDiscount = Number(coupon.maxDiscount);
              }
              discountAmount += calculatedDiscount;
            } else if (coupon.discountType === 'FIXED') {
              discountAmount += Math.min(subtotal, discountVal);
            } else if (coupon.discountType === 'FREE_SHIPPING') {
              hasFreeShippingCoupon = true;
            }

            // Increment coupon usage count
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { timesUsed: { increment: 1 } },
            });
          }
        }
      }

      // 3. Delivery Fee Calculation
      const deliverySettings = await tx.deliverySetting.findUnique({
        where: { id: 1 },
      });

      let standardFee = deliverySettings ? Number(deliverySettings.standardFee) : 250;
      let freeDeliveryMin = deliverySettings ? Number(deliverySettings.freeDeliveryMin) : 5000;
      let isFreeDeliveryActive = deliverySettings ? deliverySettings.isFreeDeliveryActive : true;

      let deliveryFee = standardFee;

      // Priority 1: Free Shipping Coupon
      if (hasFreeShippingCoupon) {
        deliveryFee = 0;
      }
      // Priority 2: Free Delivery Threshold
      else if (isFreeDeliveryActive && subtotal >= freeDeliveryMin) {
        deliveryFee = 0;
      }
      // Priority 3: City-Specific Delivery Rules
      else if (city && typeof city === 'string' && deliverySettings?.cityRules) {
        try {
          const parsedRules = JSON.parse(deliverySettings.cityRules);
          if (Array.isArray(parsedRules)) {
            const matchedRule = parsedRules.find(
              (r) => r.city && r.city.trim().toLowerCase() === city.trim().toLowerCase()
            );
            if (matchedRule) {
              deliveryFee = matchedRule.isFree ? 0 : Number(matchedRule.fee);
            }
          }
        } catch {}
      }

      // 4. Compute Final Payable Total
      const netSubtotal = Math.max(0, subtotal - discountAmount);
      const totalAmount = netSubtotal + deliveryFee;

      // 5. Create Order & OrderItems
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          subtotal,
          deliveryFee,
          discountAmount,
          couponCode: appliedCouponCode,
          totalAmount,
          status: 'PENDING',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return { newOrder: createdOrder, emailItems: emailItemsList };
    });

    // Dispatch Order Received email (background async)
    sendOrderStatusEmail({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      totalAmount: Number(newOrder.totalAmount),
      status: 'PENDING',
      items: emailItems,
    }).catch((err) => console.error('Failed to send order email:', err));

    return NextResponse.json(
      {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        subtotal: Number(newOrder.subtotal),
        deliveryFee: Number(newOrder.deliveryFee),
        discountAmount: Number(newOrder.discountAmount),
        couponCode: newOrder.couponCode,
        totalAmount: Number(newOrder.totalAmount),
        message: 'Order placed successfully.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    console.error('[POST /api/orders]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to place order. Please try again.' },
      { status: 500 }
    );
  }
}
