import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { DiscountType, PromoTarget } from '@prisma/client';

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/promotions/discounts/[id] – edit promotion
export async function PATCH(req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const promoId = parseInt(id);
    if (isNaN(promoId)) return NextResponse.json({ error: 'Invalid promotion ID' }, { status: 400 });

    const body = await req.json();
    const {
      name,
      targetType,
      targetId,
      targetName,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (targetType !== undefined) data.targetType = targetType as PromoTarget;
    if (targetId !== undefined) data.targetId = targetId ? parseInt(targetId) : null;
    if (targetName !== undefined) data.targetName = targetName?.trim() || null;
    if (discountType !== undefined) data.discountType = discountType as DiscountType;
    if (discountValue !== undefined) data.discountValue = parseFloat(discountValue) || 0;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.promotionalDiscount.update({
      where: { id: promoId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/promotions/discounts/:id]', error);
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE /api/admin/promotions/discounts/[id] – delete promotion
export async function DELETE(_req: Request, { params }: Params) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const promoId = parseInt(id);
    if (isNaN(promoId)) return NextResponse.json({ error: 'Invalid promotion ID' }, { status: 400 });

    await prisma.promotionalDiscount.delete({
      where: { id: promoId },
    });

    return NextResponse.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/admin/promotions/discounts/:id]', error);
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}

