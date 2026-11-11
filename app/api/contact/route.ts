import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, captchaToken } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Google ReCaptcha
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && captchaToken) {
      const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${captchaToken}`,
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        return NextResponse.json({ error: 'Security verification failed. Please try again.' }, { status: 400 });
      }
    } else if (recaptchaSecret) {
      return NextResponse.json({ error: 'Captcha token is missing.' }, { status: 400 });
    }

    // 2. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Email Template (Professional Dark Luxury Style)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #C9A66B; background-color: #F7F7F5; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #183629; text-transform: uppercase; letter-spacing: 2px;">Gul's Collection</h2>
          <p style="color: #C9A66B; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">New Concierge Inquiry</p>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 4px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #555;">${message}</p>
        </div>
      </div>
    `;

    // 4. Send Email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Yeh email aapke raoikram34@gmail.com par aayega
      replyTo: email,
      subject: `New Contact Inquiry: ${subject} - ${name}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
  }
}