import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/delivery-settings – public delivery rates & city rules
export async function GET() {
  try {
    let settings = await prisma.deliverySetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.deliverySetting.create({
        data: {
          id: 1,
          standardFee: 800.00,
          freeDeliveryMin: 10000.00,
          isFreeDeliveryActive: true,
          cityRules: JSON.stringify([]), // Empty default, aap admin se set karenge
        },
      });
    }

    // Bulletproof JSON Parsing (Handles both String and Array from Prisma)
    let parsedCityRules: any[] = [];
    if (settings.cityRules) {
      if (typeof settings.cityRules === 'string') {
        try { parsedCityRules = JSON.parse(settings.cityRules); } catch (e) { console.error("Parse error", e); }
      } else if (Array.isArray(settings.cityRules)) {
        parsedCityRules = settings.cityRules;
      }
    }

    return NextResponse.json({
      standardFee: Number(settings.standardFee),
      freeDeliveryMin: Number(settings.freeDeliveryMin),
      isFreeDeliveryActive: settings.isFreeDeliveryActive,
      cityRules: parsedCityRules,
    });
  } catch (error) {
    console.error('[GET /api/delivery-settings]', error);
    return NextResponse.json({ error: 'Failed to load delivery settings' }, { status: 500 });
  }
}