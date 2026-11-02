import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/promotions/active – fetch currently active automatic promotions
export async function GET() {
  try {
    const now = new Date();

    const promotions = await prisma.promotionalDiscount.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
        ],
      },
    });

    return NextResponse.json(
      promotions.map((p) => ({
        id: p.id,
        name: p.name,
        targetType: p.targetType,
        targetId: p.targetId,
        targetName: p.targetName,
        discountType: p.discountType,
        discountValue: Number(p.discountValue),
      }))
    );
  } catch (error) {
    console.error('[GET /api/promotions/active]', error);
    return NextResponse.json({ error: 'Failed to load promotions' }, { status: 500 });
  }
}

