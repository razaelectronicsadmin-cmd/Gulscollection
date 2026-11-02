import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { DiscountType } from '@prisma/client';

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/promotions/coupons/[id] – edit coupon
export async function PATCH(req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const couponId = parseInt(id);
    if (isNaN(couponId)) return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive,
    } = body;

    const data: any = {};
    if (code !== undefined) data.code = code.trim().toUpperCase();
    if (description !== undefined) data.description = description?.trim() || null;
    if (discountType !== undefined) data.discountType = discountType as DiscountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue) || 0;
    if (minOrderAmount !== undefined) data.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (usageLimit !== undefined) data.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/promotions/coupons/:id]', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE /api/admin/promotions/coupons/[id] – delete coupon
export async function DELETE(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const couponId = parseInt(id);
    if (isNaN(couponId)) return NextResponse.json({ error: 'Invalid coupon ID' }, { status: 400 });

    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/admin/promotions/coupons/:id]', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}

