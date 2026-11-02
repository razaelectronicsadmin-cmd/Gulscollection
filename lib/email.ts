import nodemailer from 'nodemailer';
import { OrderStatus } from '@prisma/client';

export interface EmailOrderPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number | string;
  status: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  cancellationReason?: string | null;
  items?: {
    name: string;
    quantity: number;
    price: number | string;
  }[];
}

// Create reusable transporter with SMTP config or fallback to mock
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }

  return null;
}

// Generate luxury branded HTML email
function generateEmailHTML(payload: EmailOrderPayload): { subject: string; html: string } {
  const { orderNumber, customerName, status, cancellationReason, totalAmount, items, trackingNumber, carrier } = payload;
  const brandGold = '#d4af37';
  const brandDark = '#0a1f11';

  let subject = `Order Update: #${orderNumber} is ${status}`;
  let headline = `Order #${orderNumber}`;
  let messageContent = '';
  let statusBadgeColor = '#2563eb';

  switch (status) {
    case 'CONFIRMED':
      subject = `Order Confirmed: #${orderNumber} is being packed!`;
      headline = 'Your Order Has Been Confirmed';
      statusBadgeColor = '#16a34a';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Your order <strong>#${orderNumber}</strong> has been confirmed and is currently being hand-packed by our artisans.
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
          We will notify you as soon as your fragrance departs our Karachi boutique for delivery.
        </p>
      `;
      break;

    case 'DISPATCHED':
      subject = `Out for Delivery: Order #${orderNumber} is on the way!`;
      headline = 'Your Order is Dispatched';
      statusBadgeColor = '#d97706';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Exciting news! Your order <strong>#${orderNumber}</strong> has been dispatched and handed over to our courier partner.
        </p>
        ${
          trackingNumber
            ? `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Courier & Tracking Information</p>
            <p style="margin: 0; font-size: 14px; color: #0f172a;"><strong>Courier Partner:</strong> ${carrier || 'Official Courier Service'}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #0f172a;"><strong>Tracking Number:</strong> <span style="font-family: monospace; font-weight: bold; background: #fff; padding: 2px 8px; border: 1px solid #cbd5e1; border-radius: 4px; color: #183629;">${trackingNumber}</span></p>
          </div>
        `
            : ''
        }
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
          Please keep your phone reachable for delivery confirmation.
        </p>
      `;
      break;

    case 'COMPLETED':
      subject = `Delivered: Thank you for shopping with Gul's Fragrances!`;
      headline = 'Wear Your Era.';
      statusBadgeColor = '#059669';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Your order <strong>#${orderNumber}</strong> has been successfully delivered! Thank you for choosing <strong>Gul&apos;s Fragrances</strong>.
        </p>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
          We hope you cherish your new signature scent. Should you ever need recommendations or bespoke layering advice, we are always here.
        </p>
      `;
      break;

    case 'CANCELLED':
      subject = `Notice: Order #${orderNumber} has been cancelled`;
      headline = 'Order Cancellation Notice';
      statusBadgeColor = '#dc2626';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Your order <strong>#${orderNumber}</strong> has been cancelled.
        </p>
        ${
          cancellationReason
            ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <strong style="color: #991b1b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Reason for Cancellation:</strong>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px;">${cancellationReason}</p>
              </div>`
            : ''
        }
        <p style="margin: 16px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280; font-style: italic;">
          Please let us know how we can improve and serve you better next time. If you have questions regarding this cancellation, feel free to reply directly to this email.
        </p>
      `;
      break;

    default: // PENDING
      subject = `Order Placed: #${orderNumber} received`;
      headline = 'Order Received';
      statusBadgeColor = '#6b7280';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          Dear <strong>${customerName}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
          We have received your order <strong>#${orderNumber}</strong> and it is awaiting verification.
        </p>
      `;
      break;
  }

  const itemsTableHTML =
    items && items.length > 0
      ? `
    <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
      <h4 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">Purchased Items</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td style="padding: 8px 0; color: #111827; border-bottom: 1px solid #f3f4f6;">
                <strong>${item.name}</strong> × ${item.quantity}
              </td>
              <td style="padding: 8px 0; text-align: right; color: #4b5563; border-bottom: 1px solid #f3f4f6;">
                PKR ${Number(item.price).toLocaleString()}
              </td>
            </tr>
          `
            )
            .join('')}
          <tr>
            <td style="padding: 12px 0; font-weight: bold; color: #111827;">Total Amount</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; color: ${brandDark}; font-size: 16px;">
              PKR ${Number(totalAmount).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
      : `
    <div style="margin-top: 20px; padding: 12px 0; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
      <span style="font-size: 14px; color: #6b7280;">Order Total:</span>
      <strong style="font-size: 16px; color: ${brandDark};">PKR ${Number(totalAmount).toLocaleString()}</strong>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f6f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f6f2; padding: 40px 10px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); max-width: 100%;">
              
              <!-- Luxury Brand Header -->
              <tr>
                <td align="center" style="background-color: ${brandDark}; padding: 32px 24px; border-bottom: 2px solid ${brandGold};">
                  <span style="display: block; color: ${brandGold}; font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; font-weight: 600; margin-bottom: 6px;">
                    Decades of Scents
                  </span>
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.05em; text-transform: uppercase;">
                    Gul&apos;s Fragrances
                  </h1>
                </td>
              </tr>

              <!-- Status Banner -->
              <tr>
                <td style="padding: 32px 32px 24px;">
                  <div style="display: inline-block; background-color: ${statusBadgeColor}15; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeColor}30; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
                    ${status}
                  </div>
                  <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px; font-family: Georgia, serif; line-height: 1.3;">
                    ${headline}
                  </h2>
                  ${messageContent}
                  ${itemsTableHTML}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #faf9f5; padding: 24px 32px; border-top: 1px solid #f0eee6; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">
                    House of Gul&apos;s • Karachi, Pakistan
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                    Questions regarding your order? Reach our boutique team directly on WhatsApp or reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html };
}

// Main email trigger function
export async function sendOrderStatusEmail(payload: EmailOrderPayload): Promise<boolean> {
  const { subject, html } = generateEmailHTML(payload);
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL LOG (Simulated - No SMTP Configured)]`);
    console.log(`To: ${payload.customerEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Order: #${payload.orderNumber} | Status: ${payload.status}`);
    if (payload.cancellationReason) {
      console.log(`Cancellation Reason: ${payload.cancellationReason}`);
    }
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const fromAddress = process.env.SMTP_FROM || '"Gul\'s Fragrances" <orders@gulscollection.com>';
    await transporter.sendMail({
      from: fromAddress,
      to: payload.customerEmail,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] Notification for #${payload.orderNumber} (${payload.status}) dispatched to ${payload.customerEmail}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${payload.customerEmail}:`, err);
    return false;
  }
}

