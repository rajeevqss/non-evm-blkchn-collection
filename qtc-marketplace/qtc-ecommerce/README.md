# QTC Marketplace

A Next.js e-commerce application built on Solana that supports multiple payment methods including QTC tokens, traditional payments via Stripe, and cryptocurrency payments via BitPay.

## Features

- **Product Catalog**: Browse and purchase products from a demo store
- **Triple Payment System**:
  - **QTC Tokens**: Pay directly with your QTC tokens using Solana wallet
  - **Card & Crypto (Stripe)**: Pay with cards, digital wallets, or crypto (USDC, USDP)
  - **Bitcoin & Crypto (BitPay)**: Pay with Bitcoin, Ethereum, and 100+ cryptocurrencies
- **Wallet Integration**: Connect with popular Solana wallets (Phantom, Solflare, Glow, Backpack)
- **Shopping Cart**: Add multiple items and manage quantities
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## Payment Methods

### 1. QTC Token Payments
- Connect your Solana wallet
- Pay directly with QTC tokens from your wallet
- Real-time balance checking and transaction confirmation

### 2. Card & Crypto Payments (Stripe)
- Powered by **Stripe** - the world's leading payment processor
- Accepts credit/debit cards, digital wallets (Apple Pay, Google Pay)
- Supports cryptocurrency payments: USDC, USDP, USDG on multiple blockchains
- Secure hosted checkout experience with automatic fiat settlement

### 3. Bitcoin & Cryptocurrency Payments (BitPay)
- Powered by **BitPay** - the most established crypto payment processor (founded 2011)
- Accepts 100+ cryptocurrencies: Bitcoin, Ethereum, Litecoin, Bitcoin Cash, and more
- Enterprise-grade security and regulatory compliance
- Lightning Network support for fast Bitcoin payments

## Setup

### Prerequisites
- Node.js 18+ and npm
- Solana wallet (for QTC payments)
- Stripe account (for card/crypto payments)
- BitPay account (for Bitcoin/crypto payments)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

3. Configure payment gateway API keys:

   **Stripe Setup:**
   - Visit [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your Secret Key and Publishable Key
   - Add to your `.env.local` file:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   ```

   **BitPay Setup:**
   - Visit [BitPay Dashboard](https://bitpay.com/dashboard/merchant/api-tokens)
   - Create a new API token
   - Add to your `.env.local` file:
   ```
   BITPAY_API_TOKEN=your_bitpay_api_token_here
   BITPAY_NOTIFICATION_EMAIL=your_email@example.com
   ```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
