import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, orderId, description, metadata } = await request.json();
    
    if (!process.env.NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: 'NOWPayments API key not configured' },
        { status: 500 }
      );
    }

    // NOWPayments API endpoints - Production mode
    const baseUrl = process.env.NOWPAYMENTS_SANDBOX === 'true' 
      ? 'https://api-sandbox.nowpayments.io/v1' 
      : 'https://api.nowpayments.io/v1';
    
    console.log('NOWPayments mode:', process.env.NOWPAYMENTS_SANDBOX === 'true' ? 'Sandbox' : 'Production');

    // First, get available currencies
    const currenciesResponse = await fetch(`${baseUrl}/currencies`, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
    });

    if (!currenciesResponse.ok) {
      throw new Error('Failed to fetch available currencies');
    }

    const currencies = await currenciesResponse.json();
    
    // Create payment
    const paymentData = {
      price_amount: amount,
      price_currency: currency || 'USD',
      pay_currency: metadata?.selectedCrypto || 'btc', // Default to BTC
      order_id: orderId || `order_${Date.now()}`,
      order_description: description || 'QTC Marketplace Purchase',
      ipn_callback_url: `${request.nextUrl.origin}/api/nowpayments/webhook`,
      success_url: `${request.nextUrl.origin}/checkout?success=true`,
      cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
    };

    const paymentResponse = await fetch(`${baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      throw new Error(errorData.message || 'Failed to create payment');
    }

    const payment = await paymentResponse.json();

    // Generate QR code for the payment address
    let qrCodeDataUrl = '';
    if (payment.pay_address) {
      const qrData = `${payment.pay_currency.toUpperCase()}:${payment.pay_address}?amount=${payment.pay_amount}`;
      qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }

    return NextResponse.json({
      id: payment.payment_id,
      payment_status: payment.payment_status,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      price_amount: payment.price_amount,
      price_currency: payment.price_currency,
      order_id: payment.order_id,
      order_description: payment.order_description,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      qr_code: qrCodeDataUrl,
      currencies: currencies.currencies || []
    });
    
  } catch (error: any) {
    console.error('NOWPayments error:', error);
    return NextResponse.json(
      { error: `NOWPayments error: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: 'NOWPayments API key not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NOWPAYMENTS_SANDBOX === 'true' 
      ? 'https://api-sandbox.nowpayments.io/v1' 
      : 'https://api.nowpayments.io/v1';
    
    console.log('NOWPayments status check mode:', process.env.NOWPAYMENTS_SANDBOX === 'true' ? 'Sandbox' : 'Production');

    const statusResponse = await fetch(`${baseUrl}/payment/${paymentId}`, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to fetch payment status');
    }

    const payment = await statusResponse.json();

    return NextResponse.json({
      id: payment.payment_id,
      payment_status: payment.payment_status,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      actually_paid: payment.actually_paid,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    });
    
  } catch (error: any) {
    console.error('NOWPayments status error:', error);
    return NextResponse.json(
      { error: `NOWPayments status error: ${error.message}` },
      { status: 500 }
    );
  }
}