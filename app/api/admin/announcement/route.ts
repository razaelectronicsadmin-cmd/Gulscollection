import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSession } from '@/lib/auth-helpers';

export async function GET() {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const bar = await prisma.announcementBar.findUnique({ where: { id: 1 } });
    return NextResponse.json(bar ?? null);
  } catch (e) {
    console.error('[GET /api/admin/announcement]', e);
    return NextResponse.json({ error: 'Failed to fetch announcement bar settings.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdminSession();
  if (authError) return authError;

  try {
    const body = await req.json();

    const allowed = [
      'isVisible', 'message',
      'showPhone', 'phoneNumber', 'phoneLink',
      'showEmail', 'emailAddress', 'emailLink',
      'showSocialIcons', 
      'instagramUrl', 'facebookUrl', 'tiktokUrl', 'youtubeUrl', 'linkedinUrl', 'pinterestUrl', 'threadsUrl',
      'showInstagram', 'showFacebook', 'showTiktok', 'showYoutube', 'showLinkedin', 'showPinterest', 'showThreads',
      'bgColor', 'textColor', 'accentColor', 'fontSize',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }

    const bar = await prisma.announcementBar.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        isVisible: data.isVisible as boolean ?? true,
        message: data.message as string ?? 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
        showPhone: data.showPhone as boolean ?? true,
        phoneNumber: data.phoneNumber as string ?? '0333-2265461',
        phoneLink: data.phoneLink as string ?? 'tel:03332265461',
        showEmail: data.showEmail as boolean ?? true,
        emailAddress: data.emailAddress as string ?? 'gulscollection.2617@gmail.com',
        emailLink: data.emailLink as string ?? 'mailto:gulscollection.2617@gmail.com',
        
        showSocialIcons: data.showSocialIcons as boolean ?? true,
        instagramUrl: data.instagramUrl as string ?? '',
        facebookUrl: data.facebookUrl as string ?? '',
        tiktokUrl: data.tiktokUrl as string ?? '',
        youtubeUrl: data.youtubeUrl as string ?? '',
        linkedinUrl: data.linkedinUrl as string ?? '',
        pinterestUrl: data.pinterestUrl as string ?? '',
        threadsUrl: data.threadsUrl as string ?? '',

        showInstagram: data.showInstagram as boolean ?? true,
        showFacebook: data.showFacebook as boolean ?? true,
        showTiktok: data.showTiktok as boolean ?? false,
        showYoutube: data.showYoutube as boolean ?? false,
        showLinkedin: data.showLinkedin as boolean ?? false,
        showPinterest: data.showPinterest as boolean ?? false,
        showThreads: data.showThreads as boolean ?? false,

        bgColor: data.bgColor as string ?? '#0b0f0e',
        textColor: data.textColor as string ?? '#F5F5F0',
        accentColor: data.accentColor as string ?? '#C9A66B',
        fontSize: data.fontSize as string ?? 'sm',
      },
    });

    return NextResponse.json(bar);
  } catch (e) {
    console.error('[PATCH /api/admin/announcement]', e);
    return NextResponse.json({ error: 'Failed to save announcement bar settings.' }, { status: 500 });
  }
}