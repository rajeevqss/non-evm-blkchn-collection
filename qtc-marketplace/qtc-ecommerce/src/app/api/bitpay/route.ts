import { NextRequest, NextResponse } from 'next/server';
import { Client, Env } from 'bitpay-sdk';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, name, description, metadata } = await request.json();
    
    if (!process.env.BITPAY_API_TOKEN) {
      return NextResponse.json(
        { error: 'BitPay API token not configured' },
        { status: 500 }
      );
    }

    // Initialize BitPay client
    const client = new Client(process.env.BITPAY_API_TOKEN, Env.Test); // Use Env.Prod for production

    // Create invoice
    const invoice = {
      price: amount,
      currency: currency || 'USD',
      orderId: `order_${Date.now()}`,
      itemDesc: name,
      itemCode: 'qtc_marketplace',
      notificationEmail: process.env.BITPAY_NOTIFICATION_EMAIL || '',
      redirectURL: `${request.nextUrl.origin}/checkout?success=true`,
      closeURL: `${request.nextUrl.origin}/checkout?canceled=true`,
      extendedNotifications: true,
      buyer: {
        email: metadata?.customer_email || '',
      },
      posData: JSON.stringify({
        orderId: `order_${Date.now()}`,
        customerId: metadata?.customer_id || '',
        orderItems: metadata?.order_items || []
      })
    };

    const createdInvoice = await client.createInvoice(invoice);

    return NextResponse.json({
      id: createdInvoice.id,
      url: createdInvoice.url,
      status: createdInvoice.status,
      price: createdInvoice.price,
      currency: createdInvoice.currency,
      expirationTime: createdInvoice.expirationTime
    });
    
  } catch (error: any) {
    console.error('BitPay error:', error);
    return NextResponse.json(
      { error: `BitPay error: ${error.message}` },
      { status: 500 }
    );
  }
}