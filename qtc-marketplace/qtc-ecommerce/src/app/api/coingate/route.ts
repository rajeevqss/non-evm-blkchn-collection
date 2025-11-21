import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// CoinGate API Configuration
const COINGATE_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.coingate.com/v2'
  : 'https://api-sandbox.coingate.com/v2';

const COINGATE_API_TOKEN = process.env.NODE_ENV === 'production'
  ? process.env.COINGATE_API_TOKEN
  : process.env.COINGATE_SANDBOX_TOKEN || 'tpKPm8uOr8N2LLn1RQHK5nHR'; // Default sandbox token

interface CreateOrderRequest {
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
  callbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CoinGateOrder {
  id: number;
  status: string;
  created_at: string;
  order_id: string;
  price_amount: string;
  price_currency: string;
  receive_amount: string;
  receive_currency: string;
  pay_amount: string;
  pay_currency: string;
  payment_address: string;
  payment_url: string;
  expire_at: string;
  token: string;
  qr_code?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();
    const { amount, currency, description, orderId, callbackUrl, successUrl, cancelUrl } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      );
    }

    // Create order with CoinGate
    const orderData = {
      order_id: orderId || `qtc-${uuidv4()}`,
      price_amount: amount.toString(),
      price_currency: currency.toUpperCase(),
      receive_currency: currency.toUpperCase(),
      title: 'QTC Marketplace Purchase',
      description: description || 'Purchase from QTC Marketplace',
      callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/coingate/webhook`,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      // Enable QR code generation
      purchaser_email: 'customer@qtc-marketplace.com', // Optional but recommended
      // Faster processing
      underpaid_cover_pct: 2.0, // Allow small underpayments
      overpaid_cover_pct: 2.0, // Allow small overpayments
      // Force payment currency to Bitcoin for testing (Solana might not be supported in sandbox)
      pay_currency: 'BTC', // Override to Bitcoin for now
    };

    console.log('Creating CoinGate order with data:', orderData);

    const response = await axios.post(
      `${COINGATE_API_URL}/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${COINGATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const order: CoinGateOrder = response.data;
    console.log('CoinGate order created:', order.id);

    // Don't generate QR code URL here - let the frontend handle it
    let qrCodeUrl = null;

    // Log the full response to debug
    console.log('Full CoinGate response:', order);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.order_id,
        status: order.status,
        amount: order.price_amount,
        currency: order.price_currency,
        payAmount: order.pay_amount || order.price_amount, // Fallback
        payCurrency: order.pay_currency || order.price_currency, // Fallback
        paymentAddress: order.payment_address,
        paymentUrl: order.payment_url,
        qrCodeUrl,
        expiresAt: order.expire_at,
        token: order.token,
        createdAt: order.created_at,
      }
    });

  } catch (error: any) {
    console.error('CoinGate API error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error.response?.data?.message || error.message 
      },
      { status: 500 }
    );
  }
}

// GET method to check order status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${COINGATE_API_URL}/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${COINGATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const order: CoinGateOrder = response.data;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderId: order.order_id,
        status: order.status,
        amount: order.price_amount,
        currency: order.price_currency,
        payAmount: order.pay_amount,
        payCurrency: order.pay_currency,
        paymentAddress: order.payment_address,
        paymentUrl: order.payment_url,
        expiresAt: order.expire_at,
        createdAt: order.created_at,
      }
    });

  } catch (error: any) {
    console.error('CoinGate status check error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error.response?.data?.message || error.message 
      },
      { status: 500 }
    );
  }
}