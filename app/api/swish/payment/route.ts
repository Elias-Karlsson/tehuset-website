import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import site from '../../../../content/site.json';
import productsData from '../../../../content/products.json';

type SwishPayload = { productId: string; quantity: number; payerAlias?: string; customerEmail?: string; lang?: 'sv' | 'en' };

async function sendConfirmation(subject: string, text: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({ from: process.env.ORDER_EMAIL_FROM ?? process.env.SMTP_USER, to: site.adminEmail, subject, text });
  return true;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SwishPayload;
  const product = productsData.products.find((item) => item.id === body.productId && item.active);
  const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));
  if (!product) return NextResponse.json({ message: body.lang === 'en' ? 'Product not found.' : 'Produkten hittades inte.' }, { status: 404 });
  if (!body.payerAlias) return NextResponse.json({ message: body.lang === 'en' ? 'Add a Swish phone number.' : 'Ange ett Swish-nummer.' }, { status: 400 });

  const amount = product.priceSek * quantity;
  const instructionUUID = crypto.randomUUID().replace(/-/g, '').toUpperCase();
  const paymentReference = `TEHUSET-${Date.now()}`;

  const orderText = `Order ${paymentReference}\nProduct: ${product.name.sv}\nQuantity: ${quantity}\nAmount: ${amount} SEK\nSwish: ${body.payerAlias}\nCustomer email: ${body.customerEmail ?? 'not provided'}`;

  if (!process.env.SWISH_PAYEE_ALIAS || !process.env.SWISH_CALLBACK_URL || process.env.SWISH_DEMO_MODE === 'true') {
    await sendConfirmation(`Tehuset merch order ${paymentReference}`, `${orderText}\n\nDemo mode: no live Swish request was sent.`);
    return NextResponse.json({ paymentReference, instructionUUID, demo: true, message: body.lang === 'en' ? 'Demo order created. Configure Swish certificates and aliases for live payments.' : 'Demoorder skapad. Konfigurera Swish-certifikat och alias för livebetalningar.' });
  }

  const swishBody = {
    payeePaymentReference: paymentReference,
    callbackUrl: process.env.SWISH_CALLBACK_URL,
    payeeAlias: process.env.SWISH_PAYEE_ALIAS,
    payerAlias: body.payerAlias,
    amount: amount.toFixed(2),
    currency: 'SEK',
    message: `Tehuset merch ${quantity}x`,
  };

  const response = await fetch(`${process.env.SWISH_API_URL ?? 'https://mss.cpc.getswish.net/swish-cpcapi'}/api/v2/paymentrequests/${instructionUUID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(swishBody),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ message: body.lang === 'en' ? 'Swish request failed.' : 'Swish-förfrågan misslyckades.', detail }, { status: 502 });
  }

  await sendConfirmation(`Tehuset merch order ${paymentReference}`, orderText);
  return NextResponse.json({ paymentReference, instructionUUID, message: body.lang === 'en' ? 'Swish request created. Open Swish to complete payment.' : 'Swish-betalning skapad. Öppna Swish för att slutföra.' });
}
