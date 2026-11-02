import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';

// GET /api/admin/promotions/delivery
export async function GET() {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    let settings = await prisma.deliverySetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.deliverySetting.create({
        data: {
          id: 1,
          standardFee: 250.00,
          freeDeliveryMin: 5000.00,
          isFreeDeliveryActive: true,
          cityRules: JSON.stringify([
            { city: 'Karachi', fee: 0, isFree: true, note: 'Local Boutique Delivery' },
          ]),
        },
      });
    }

    let parsedCityRules: any[] = [];
    if (settings.cityRules) {
      try {
        parsedCityRules = JSON.parse(settings.cityRules);
      } catch {}
    }

    return NextResponse.json({
      standardFee: Number(settings.standardFee),
      freeDeliveryMin: Number(settings.freeDeliveryMin),
      isFreeDeliveryActive: settings.isFreeDeliveryActive,
      cityRules: parsedCityRules,
    });
  } catch (error) {
    console.error('[GET /api/admin/promotions/delivery]', error);
    return NextResponse.json({ error: 'Failed to fetch delivery settings' }, { status: 500 });
  }
}

// PATCH /api/admin/promotions/delivery
export async function PATCH(req: Request) {
  const unauth = await requireAdminSession();
  if (unauth) return unauth;

  try {
    const body = await req.json();
    const { standardFee, freeDeliveryMin, isFreeDeliveryActive, cityRules } = body;

    const updated = await prisma.deliverySetting.upsert({
      where: { id: 1 },
      update: {
        ...(standardFee !== undefined && { standardFee: parseFloat(standardFee) || 0 }),
        ...(freeDeliveryMin !== undefined && { freeDeliveryMin: parseFloat(freeDeliveryMin) || 0 }),
        ...(isFreeDeliveryActive !== undefined && { isFreeDeliveryActive: Boolean(isFreeDeliveryActive) }),
        ...(cityRules !== undefined && { cityRules: typeof cityRules === 'string' ? cityRules : JSON.stringify(cityRules) }),
      },
      create: {
        id: 1,
        standardFee: parseFloat(standardFee) || 250.00,
        freeDeliveryMin: parseFloat(freeDeliveryMin) || 5000.00,
        isFreeDeliveryActive: isFreeDeliveryActive !== undefined ? Boolean(isFreeDeliveryActive) : true,
        cityRules: typeof cityRules === 'string' ? cityRules : JSON.stringify(cityRules || []),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery settings saved successfully.',
      settings: updated,
    });
  } catch (error) {
    console.error('[PATCH /api/admin/promotions/delivery]', error);
    return NextResponse.json({ error: 'Failed to update delivery settings' }, { status: 500 });
  }
}

