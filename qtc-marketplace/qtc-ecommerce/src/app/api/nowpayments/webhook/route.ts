import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data for debugging
    console.log('NOWPayments webhook received:', body);
    
    // Extract payment information
    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      order_id,
      order_description,
      actually_paid,
      outcome_amount,
      outcome_currency
    } = body;

    // Handle different payment statuses
    switch (payment_status) {
      case 'waiting':
        console.log(`Payment ${payment_id} is waiting for confirmation`);
        break;
      case 'confirming':
        console.log(`Payment ${payment_id} is being confirmed`);
        break;
      case 'confirmed':
        console.log(`Payment ${payment_id} confirmed!`);
        // Here you would typically:
        // - Update your database
        // - Send confirmation email
        // - Release the product/service
        break;
      case 'sending':
        console.log(`Payment ${payment_id} is being sent to your wallet`);
        break;
      case 'finished':
        console.log(`Payment ${payment_id} completed successfully!`);
        // Final confirmation - payment is complete
        break;
      case 'failed':
        console.log(`Payment ${payment_id} failed`);
        // Handle failed payment
        break;
      case 'refunded':
        console.log(`Payment ${payment_id} was refunded`);
        // Handle refund
        break;
      case 'expired':
        console.log(`Payment ${payment_id} expired`);
        // Handle expired payment
        break;
      default:
        console.log(`Unknown payment status: ${payment_status} for payment ${payment_id}`);
    }

    // You can add your business logic here
    // For example, update order status in your database
    
    // Always return 200 OK to acknowledge receipt of the webhook
    return NextResponse.json({ status: 'ok' });
    
  } catch (error: any) {
    console.error('NOWPayments webhook error:', error);
    
    // Return 200 even on error to prevent NOWPayments from retrying
    // Log the error for debugging
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    });
  }
}