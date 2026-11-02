import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyCaptcha } from '@/lib/captcha';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, captchaToken } = body;

    // 1. Verify reCAPTCHA token if configured
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const captchaResult = await verifyCaptcha(captchaToken);
      if (!captchaResult.success) {
        return NextResponse.json(
          { error: captchaResult.error || 'Captcha verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 422 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // Generate secure 64-character token
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expiry,
        },
      });

      // Construct reset link
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const resetLink = `${baseUrl.replace(/\/$/, '')}/admin/reset-password?token=${token}`;

      await sendPasswordResetEmail(cleanEmail, resetLink, user.name || 'Admin');
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been dispatched to your inbox.',
    });
  } catch (error: any) {
    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}

