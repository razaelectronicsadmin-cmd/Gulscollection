import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

// GET /api/admin/settings - get current admin profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// POST /api/admin/settings - update email or password
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, currentPassword, newEmail, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // 1. Verify current password
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to authorize account modifications.' },
        { status: 400 }
      );
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 403 });
    }

    // 2. Action: UPDATE_EMAIL
    if (action === 'UPDATE_EMAIL') {
      if (!newEmail || typeof newEmail !== 'string' || !newEmail.includes('@')) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 });
      }

      const cleanNewEmail = newEmail.trim().toLowerCase();
      if (cleanNewEmail === user.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'New email cannot be identical to the current email.' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: cleanNewEmail },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: 'This email is already in use by another account.' },
          { status: 409 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { email: cleanNewEmail },
      });

      return NextResponse.json({
        success: true,
        message: 'Admin email updated successfully. Please sign in again with your new email on your next session.',
      });
    }

    // 3. Action: UPDATE_PASSWORD
    if (action === 'UPDATE_PASSWORD') {
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 422 }
        );
      }

      const isSameAsOld = await bcrypt.compare(newPassword, user.password);
      if (isSameAsOld) {
        return NextResponse.json(
          { error: 'New password must be different from your current password.' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'Administrative password updated successfully.',
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Settings Error]', error);
    return NextResponse.json(
      { error: 'Failed to update administrative settings.' },
      { status: 500 }
    );
  }
}

