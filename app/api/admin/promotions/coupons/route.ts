import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';
import { DiscountType } from '@prisma/client';

// GET /api/admin/promotions/coupons – list coupons
export async function GET() {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('[GET /api/admin/promotions/coupons]', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/admin/promotions/coupons – create coupon
export async function POST(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
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

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check unique
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json({ error: `Coupon code "${cleanCode}" already exists.` }, { status: 409 });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description?.trim() || null,
        discountType: (discountType as DiscountType) || 'PERCENTAGE',
        discountValue: parseFloat(discountValue) || 0,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/promotions/coupons]', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

