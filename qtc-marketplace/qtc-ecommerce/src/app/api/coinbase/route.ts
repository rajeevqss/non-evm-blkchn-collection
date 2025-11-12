import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, name, description, metadata } = await request.json();
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe API key not configured' },
        { status: 500 }
      );
    }

    // Create a Stripe Checkout Session with crypto support
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link', 'crypto'], // Enable crypto stablecoin payments
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase() || 'usd',
            product_data: {
              name: name,
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        customer_id: metadata?.customer_id || '',
        order_items: JSON.stringify(metadata?.order_items || []),
      },
      success_url: `${request.nextUrl.origin}/checkout?success=true`,
      cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
      payment_intent_data: {
        metadata: {
          customer_id: metadata?.customer_id || '',
          order_items: JSON.stringify(metadata?.order_items || []),
        },
      }
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
      payment_status: session.payment_status,
    });
    
  } catch (error: any) {
    console.error('Server error creating payment session:', error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}