import { NextRequest, NextResponse } from 'next/server';

interface CoinGateWebhook {
  id: number;
  status: string;
  price_amount: string;
  price_currency: string;
  receive_amount: string;
  receive_currency: string;
  pay_amount: string;
  pay_currency: string;
  order_id: string;
  payment_address: string;
  created_at: string;
  updated_at: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const webhook: CoinGateWebhook = await request.json();
    
    console.log('📥 CoinGate webhook received:', {
      orderId: webhook.order_id,
      status: webhook.status,
      amount: webhook.price_amount,
      currency: webhook.price_currency,
    });

    // Verify webhook authenticity (optional but recommended)
    // const signature = request.headers.get('x-coingate-signature');
    // if (signature) {
    //   // Verify signature with your secret key
    // }

    // Handle different payment statuses
    switch (webhook.status) {
      case 'paid':
        console.log('✅ Payment confirmed:', webhook.order_id);
        // Here you would:
        // 1. Update your database
        // 2. Send confirmation email
        // 3. Process the order
        // 4. Update inventory
        await handlePaymentSuccess(webhook);
        break;

      case 'confirmed':
        console.log('🔒 Payment confirmed on blockchain:', webhook.order_id);
        await handlePaymentConfirmed(webhook);
        break;

      case 'expired':
        console.log('⏰ Payment expired:', webhook.order_id);
        await handlePaymentExpired(webhook);
        break;

      case 'invalid':
        console.log('❌ Payment invalid:', webhook.order_id);
        await handlePaymentInvalid(webhook);
        break;

      case 'canceled':
        console.log('🚫 Payment canceled:', webhook.order_id);
        await handlePaymentCanceled(webhook);
        break;

      default:
        console.log('📊 Payment status update:', webhook.status, webhook.order_id);
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(webhook: CoinGateWebhook) {
  // TODO: Implement payment success logic
  console.log('💰 Processing successful payment for order:', webhook.order_id);
  
  // Example implementation:
  // 1. Update order status in database
  // 2. Send confirmation email to customer
  // 3. Update inventory
  // 4. Trigger order fulfillment
  
  // You can integrate with your existing database here
  // Example:
  // await updateOrderStatus(webhook.order_id, 'paid');
  // await sendConfirmationEmail(webhook.order_id);
  // await updateInventory(webhook.order_id);
}

async function handlePaymentConfirmed(webhook: CoinGateWebhook) {
  console.log('🔒 Payment confirmed on blockchain:', webhook.order_id);
  
  // Handle blockchain confirmation (usually more secure than 'paid')
  // await updateOrderStatus(webhook.order_id, 'confirmed');
  // await finalizeOrder(webhook.order_id);
}

async function handlePaymentExpired(webhook: CoinGateWebhook) {
  console.log('⏰ Payment expired for order:', webhook.order_id);
  
  // Handle expired payments
  // await updateOrderStatus(webhook.order_id, 'expired');
  // await releaseReservedInventory(webhook.order_id);
}

async function handlePaymentInvalid(webhook: CoinGateWebhook) {
  console.log('❌ Invalid payment for order:', webhook.order_id);
  
  // Handle invalid payments
  // await updateOrderStatus(webhook.order_id, 'invalid');
  // await notifyAdministrators(webhook.order_id);
}

async function handlePaymentCanceled(webhook: CoinGateWebhook) {
  console.log('🚫 Payment canceled for order:', webhook.order_id);
  
  // Handle canceled payments
  // await updateOrderStatus(webhook.order_id, 'canceled');
  // await releaseReservedInventory(webhook.order_id);
}

// Allow GET for webhook verification
export async function GET() {
  return NextResponse.json({ message: 'CoinGate webhook endpoint' });
}