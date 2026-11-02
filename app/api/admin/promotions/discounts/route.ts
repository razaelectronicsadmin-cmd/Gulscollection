import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { DiscountType, PromoTarget } from '@prisma/client';

// GET /api/admin/promotions/discounts – list automatic promotions
export async function GET() {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const discounts = await prisma.promotionalDiscount.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('[GET /api/admin/promotions/discounts]', error);
    return NextResponse.json({ error: 'Failed to fetch promotional discounts' }, { status: 500 });
  }
}

// POST /api/admin/promotions/discounts – create automatic promotion
export async function POST(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
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

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Promotion name is required.' }, { status: 400 });
    }

    const newDiscount = await prisma.promotionalDiscount.create({
      data: {
        name: name.trim(),
        targetType: (targetType as PromoTarget) || 'CATEGORY',
        targetId: targetId ? parseInt(targetId) : null,
        targetName: targetName?.trim() || null,
        discountType: (discountType as DiscountType) || 'PERCENTAGE',
        discountValue: parseFloat(discountValue) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/promotions/discounts]', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}

