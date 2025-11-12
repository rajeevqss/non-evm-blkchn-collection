export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchProduct(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// Convert USD price to QTC tokens (1 USD = 10 QTC for simplicity)
export function usdToQTC(usdPrice: number): number {
  return Math.round(usdPrice * 10);
}

// Stripe Payment Integration
export interface StripeSession {
  id: string;
  url: string;
  payment_status: string;
}

export async function createStripePayment(
  amount: number,
  currency: string = 'USD',
  name: string,
  description: string,
  metadata?: any
): Promise<StripeSession> {
  const response = await fetch('/api/coinbase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      name,
      description,
      metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create payment session: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// BitPay Payment Integration
export interface BitPayInvoice {
  id: string;
  url: string;
  status: string;
  price: number;
  currency: string;
  expirationTime: number;
}

export async function createBitPayInvoice(
  amount: number,
  currency: string = 'USD',
  name: string,
  description: string,
  metadata?: any
): Promise<BitPayInvoice> {
  const response = await fetch('/api/bitpay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      name,
      description,
      metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create BitPay invoice: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// NOWPayments Integration
export interface NOWPayment {
  id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
  qr_code: string;
  currencies: string[];
}

export interface NOWPaymentStatus {
  id: string;
  payment_status: string;
  pay_amount: number;
  pay_currency: string;
  actually_paid?: number;
  created_at: string;
  updated_at: string;
}

export async function createNOWPayment(
  amount: number,
  currency: string = 'USD',
  description: string,
  metadata?: any
): Promise<NOWPayment> {
  const response = await fetch('/api/nowpayments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency,
      orderId: `qtc_order_${Date.now()}`,
      description,
      metadata
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create NOWPayment: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getNOWPaymentStatus(paymentId: string): Promise<NOWPaymentStatus> {
  const response = await fetch(`/api/nowpayments?payment_id=${paymentId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to get payment status: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}