import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/coupons/validate – validate coupon code against cart subtotal
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter a coupon code.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Math.max(0, parseFloat(subtotal) || 0);

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code.' }, { status: 404 });
    }

    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      return NextResponse.json({ error: 'This coupon is not active yet.' }, { status: 400 });
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its maximum redemption limit.' }, { status: 400 });
    }

    if (coupon.minOrderAmount !== null && orderSubtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        error: `Minimum order amount of PKR ${Number(coupon.minOrderAmount).toLocaleString()} required for this coupon.`,
      }, { status: 400 });
    }

    // Calculate discount value
    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderSubtotal * discountVal) / 100;
      if (coupon.maxDiscount !== null && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = Math.min(orderSubtotal, discountVal);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discountAmount = 0; // Special flag handled in shipping
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: discountVal,
      discountAmount: Math.round(discountAmount),
      description: coupon.description,
      isFreeShipping: coupon.discountType === 'FREE_SHIPPING',
    });
  } catch (error) {
    console.error('[POST /api/coupons/validate]', error);
    return NextResponse.json({ error: 'Failed to validate coupon code.' }, { status: 500 });
  }
}

