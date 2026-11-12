import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const DEFAULTS = {
  id: 1,
  isVisible: true,
  message: 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
  showPhone: true,
  phoneNumber: '0333-2265461',
  phoneLink: 'tel:03332265461',
  showEmail: true,
  emailAddress: 'gulscollection.2617@gmail.com',
  emailLink: 'mailto:gulscollection.2617@gmail.com',
  showSocialIcons: true,
  
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  pinterestUrl: '',
  threadsUrl: '',

  showInstagram: true,
  showFacebook: true,
  showTiktok: false,
  showYoutube: false,
  showLinkedin: false,
  showPinterest: false,
  showThreads: false,

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
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}