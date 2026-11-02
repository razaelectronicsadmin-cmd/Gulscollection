import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { OrderStatus } from '@prisma/client';
import { sendOrderStatusEmail } from '@/lib/email';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/orders/[id] – get detailed order information
export async function GET(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                imageURL: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json(order);
  } catch (error) {
    console.error('[GET /api/admin/orders/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] – update status, enforce cancellation reason, trigger automated email
export async function PATCH(req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { status, cancellationReason, trackingNumber, carrier } = body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    // Enforce mandatory cancellation reason when marking CANCELLED
    if (status === 'CANCELLED') {
      if (!cancellationReason || !cancellationReason.trim()) {
        return NextResponse.json(
          { error: 'A cancellation reason is required when cancelling an order.' },
          { status: 422 }
        );
      }
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update in database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        cancellationReason: status === 'CANCELLED' ? cancellationReason.trim() : null,
        ...(trackingNumber !== undefined && { trackingNumber: trackingNumber ? trackingNumber.trim() : null }),
        ...(carrier !== undefined && { carrier: carrier ? carrier.trim() : null }),
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, imageURL: true },
            },
          },
        },
      },
    });

    // Trigger Automated Email Notification if status changed
    if (currentOrder.status !== status || (status === 'DISPATCHED' && trackingNumber && trackingNumber !== currentOrder.trackingNumber)) {
      const emailPayload = {
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.customerName,
        customerEmail: updatedOrder.customerEmail,
        totalAmount: Number(updatedOrder.totalAmount),
        status: updatedOrder.status,
        trackingNumber: updatedOrder.trackingNumber,
        carrier: updatedOrder.carrier,
        cancellationReason: updatedOrder.cancellationReason,
        items: updatedOrder.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
        })),
      };

      // Dispatched in background
      sendOrderStatusEmail(emailPayload).catch((err) => {
        console.error('Failed to dispatch status email:', err);
      });
    }

    return NextResponse.json({
      order: updatedOrder,
      message: `Order status updated to ${status}. Email notification sent.`,
    });
  } catch (error) {
    console.error('[PATCH /api/admin/orders/:id]', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

