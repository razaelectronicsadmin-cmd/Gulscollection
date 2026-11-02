import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default fallback — used if the DB row doesn't exist yet
const DEFAULTS = {
  id: 1,
  isVisible: true,
  message: 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
  showPhone: true,
  phoneNumber: '0333-2265461',
  phoneLink: 'tel:03332265461',
  showEmail: true,
  emailAddress: 'gulscollection@gmail.com',
  emailLink: 'mailto:gulscollection@gmail.com',
  showSocialIcons: true,
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: 'https://youtube.com',
  bgColor: '#0b0f0e',
  textColor: '#F5F5F0',
  accentColor: '#C9A66B',
  fontSize: 'sm',
};

export async function GET() {
  try {
    const bar = await prisma.announcementBar.findUnique({ where: { id: 1 } });
    return NextResponse.json(bar ?? DEFAULTS, {
      headers: {
        // Cache for 60s on CDN, allow stale for 120s — still fresh enough for a bar
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch {
    // Graceful fallback: never crash the Navbar
    return NextResponse.json(DEFAULTS);
  }
}

