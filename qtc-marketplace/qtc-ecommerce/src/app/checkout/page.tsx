'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletInfo } from '@/components/WalletConnect';
import { Product, usdToQTC, createStripePayment, createBitPayInvoice, createNOWPayment, getNOWPaymentStatus, NOWPayment } from '@/lib/api';
import { getQTCBalance, createPaymentTransaction, connection } from '@/lib/solana';
import Image from 'next/image';

interface CartItem extends Product {
  quantity: number;
}

export default function CheckoutPage() {
  const { publicKey, connected, signTransaction } = useWallet();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [qtcBalance, setQtcBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qtc' | 'stripe' | 'bitpay' | 'nowpayments'>('qtc');
  const [nowPayment, setNowPayment] = useState<NOWPayment | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    const savedCart = localStorage.getItem('qtc-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      getQTCBalance(publicKey).then(setQtcBalance);
    }
  }, [connected, publicKey]);

  const totalQTC = cartItems.reduce((sum, item) => 
    sum + (usdToQTC(item.price) * item.quantity), 0
  );

  const totalUSD = cartItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  const handleQTCPayment = async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert('Please connect your wallet first');
      return;
    }

    if (qtcBalance < totalQTC) {
      alert(`Insufficient QTC balance. You have ${qtcBalance} QTC but need ${totalQTC} QTC`);
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Creating payment transaction for', totalQTC, 'QTC');
      
      // Create the payment transaction
      const transaction = await createPaymentTransaction(publicKey, totalQTC);
      
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm the transaction
      await connection.confirmTransaction({
        signature,
        blockhash: transaction.recentBlockhash!,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');
      
      console.log('Payment successful! Signature:', signature);
      
      // Clear cart after successful payment
      localStorage.removeItem('qtc-cart');
      setCartItems([]);
      
      // Refresh QTC balance
      const newBalance = await getQTCBalance(publicKey);
      setQtcBalance(newBalance);
      
      alert(`Payment successful! Paid ${totalQTC} QTC\nTransaction: ${signature}`);
    } catch (error: any) {
      console.error('Payment failed:', error);
      if (error.message?.includes('User rejected')) {
        alert('Payment cancelled by user');
      } else {
        alert('Payment failed. Please try again.\n' + error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderDescription = cartItems.map(item => 
        `${item.title} x${item.quantity}`
      ).join(', ');

      const session = await createStripePayment(
        totalUSD,
        'USD',
        'QTC Marketplace Purchase',
        orderDescription,
        {
          customer_id: publicKey?.toString(),
          order_items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        }
      );

      // Redirect to Stripe Checkout
      window.location.href = session.url;
      
    } catch (error: any) {
      console.error('Failed to create Stripe payment session:', error);
      alert('Failed to create Stripe payment session. Please try again.\n' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBitPayPayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderDescription = cartItems.map(item => 
        `${item.title} x${item.quantity}`
      ).join(', ');

      const invoice = await createBitPayInvoice(
        totalUSD,
        'USD',
        'QTC Marketplace Purchase',
        orderDescription,
        {
          customer_id: publicKey?.toString(),
          order_items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        }
      );

      // Redirect to BitPay invoice
      window.location.href = invoice.url;
      
    } catch (error: any) {
      console.error('Failed to create BitPay invoice:', error);
      alert('Failed to create BitPay invoice. Please try again.\n' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNOWPayment = async () => {
    setIsProcessing(true);
    
    try {
      const orderDescription = cartItems.map(item => 
        `${item.title} x${item.quantity}`
      ).join(', ');

      const payment = await createNOWPayment(
        totalUSD,
        'USD',
        orderDescription,
        {
          customer_id: publicKey?.toString(),
          selectedCrypto: selectedCrypto,
          order_items: cartItems.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        }
      );

      setNowPayment(payment);
      setPaymentStatus('waiting');
      
      // Start polling for payment status
      const pollPaymentStatus = async () => {
        try {
          const status = await getNOWPaymentStatus(payment.id);
          setPaymentStatus(status.payment_status);
          
          if (status.payment_status === 'finished') {
            // Payment completed successfully
            localStorage.removeItem('qtc-cart');
            setCartItems([]);
            alert('Payment completed successfully!');
            return;
          } else if (status.payment_status === 'failed' || status.payment_status === 'expired') {
            alert('Payment failed or expired. Please try again.');
            return;
          }
          
          // Continue polling if payment is still pending
          if (['waiting', 'confirming', 'confirmed', 'sending'].includes(status.payment_status)) {
            setTimeout(pollPaymentStatus, 5000); // Check every 5 seconds
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          setTimeout(pollPaymentStatus, 10000); // Retry after 10 seconds on error
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollPaymentStatus, 3000);
      
    } catch (error: any) {
      console.error('Failed to create NOWPayment:', error);
      alert('Failed to create NOWPayment. Please try again.\n' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to proceed with checkout</p>
        <WalletInfo />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <h1 className="text-3xl font-bold mb-4">No Items in Cart</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart first</p>
        <a href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b last:border-b-0">
                <div className="relative w-16 h-16 bg-gray-100 rounded">
                  <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  <p className="text-blue-600 font-bold">{usdToQTC(item.price)} QTC each</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{usdToQTC(item.price) * item.quantity} QTC</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Payment</h2>
          
          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Choose Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qtc"
                  checked={paymentMethod === 'qtc'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'qtc' | 'stripe' | 'bitpay')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">QTC Token</div>
                  <div className="text-sm text-gray-600">Pay with your QTC tokens</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'qtc' | 'stripe' | 'bitpay')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Card & Crypto (Stripe)</div>
                  <div className="text-sm text-gray-600">Pay with cards, digital wallets, or crypto (USDC, USDP)</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bitpay"
                  checked={paymentMethod === 'bitpay'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'qtc' | 'stripe' | 'bitpay' | 'nowpayments')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Bitcoin & Crypto (BitPay)</div>
                  <div className="text-sm text-gray-600">Pay with Bitcoin, Ethereum, 100+ cryptocurrencies</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="nowpayments"
                  checked={paymentMethod === 'nowpayments'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'qtc' | 'stripe' | 'bitpay' | 'nowpayments')}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Crypto QR Payment (NOWPayments)</div>
                  <div className="text-sm text-gray-600">Pay with 300+ cryptocurrencies via QR code - 0.5% fee</div>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'qtc' && (
            <>
              <div className="mb-6">
                <WalletInfo />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Your QTC Balance</span>
                  <span className="font-bold">{qtcBalance} QTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Required</span>
                  <span className="font-bold text-blue-600">{totalQTC} QTC</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span>Remaining After Purchase</span>
                  <span className={`font-bold ${qtcBalance - totalQTC >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {qtcBalance - totalQTC} QTC
                  </span>
                </div>
              </div>

              {qtcBalance < totalQTC && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">
                    Insufficient QTC balance. You need {totalQTC - qtcBalance} more QTC tokens.
                  </p>
                </div>
              )}

              <button 
                onClick={handleQTCPayment}
                disabled={isProcessing || !connected || qtcBalance < totalQTC}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isProcessing || !connected || qtcBalance < totalQTC
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : `Pay ${totalQTC} QTC`}
              </button>
            </>
          )}

          {paymentMethod === 'stripe' && (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-bold text-blue-600">${totalUSD.toFixed(2)} USD</span>
                </div>
                <div className="text-sm text-gray-600">
                  Pay with credit/debit cards, digital wallets, or crypto (USDC on Solana/Ethereum)
                </div>
              </div>

              <button 
                onClick={handleStripePayment}
                disabled={isProcessing}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Creating Payment...' : `Pay $${totalUSD.toFixed(2)} with Card/Crypto`}
              </button>
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                Powered by Stripe
              </div>
            </>
          )}

          {paymentMethod === 'bitpay' && (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-bold text-blue-600">${totalUSD.toFixed(2)} USD</span>
                </div>
                <div className="text-sm text-gray-600">
                  Pay with Bitcoin, Ethereum, Litecoin, and 100+ cryptocurrencies via BitPay
                </div>
              </div>

              <button 
                onClick={handleBitPayPayment}
                disabled={isProcessing}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {isProcessing ? 'Creating Invoice...' : `Pay $${totalUSD.toFixed(2)} with Bitcoin/Crypto`}
              </button>
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                Powered by BitPay
              </div>
            </>
          )}

          {paymentMethod === 'nowpayments' && (
            <>
              {!nowPayment ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-bold text-blue-600">${totalUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Select cryptocurrency and pay via QR code with NOWPayments
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-amber-800 text-sm font-medium">⚠️ Production Mode</p>
                      <p className="text-amber-700 text-xs">Real cryptocurrency payments will be processed. Please verify all details before proceeding.</p>
                    </div>
                    
                    {/* Cryptocurrency Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Cryptocurrency
                      </label>
                      <select
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="btc">Bitcoin (BTC)</option>
                        <option value="eth">Ethereum (ETH)</option>
                        <option value="ltc">Litecoin (LTC)</option>
                        <option value="bch">Bitcoin Cash (BCH)</option>
                        <option value="xrp">Ripple (XRP)</option>
                        <option value="ada">Cardano (ADA)</option>
                        <option value="dot">Polkadot (DOT)</option>
                        <option value="matic">Polygon (MATIC)</option>
                        <option value="sol">Solana (SOL)</option>
                        <option value="usdt">Tether (USDT)</option>
                        <option value="usdc">USD Coin (USDC)</option>
                        <option value="dai">Dai (DAI)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleNOWPayment}
                    disabled={isProcessing}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isProcessing ? 'Creating Payment...' : `Generate QR Code for ${selectedCrypto.toUpperCase()}`}
                  </button>
                </>
              ) : (
                <>
                  {/* QR Code Payment Display */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Scan QR Code to Pay</h3>
                    
                    {/* Payment Status */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        paymentStatus === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        paymentStatus === 'confirming' ? 'bg-blue-100 text-blue-800' :
                        paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                        paymentStatus === 'sending' ? 'bg-purple-100 text-purple-800' :
                        paymentStatus === 'finished' ? 'bg-green-100 text-green-800' :
                        paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Status: {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                      </div>
                    </div>

                    {/* QR Code */}
                    {nowPayment.qr_code && (
                      <div className="mb-6 flex justify-center">
                        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                          <img 
                            src={nowPayment.qr_code} 
                            alt="Payment QR Code" 
                            className="w-64 h-64"
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold">{nowPayment.pay_amount} {nowPayment.pay_currency.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-mono text-xs break-all">{nowPayment.pay_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold">{nowPayment.order_id}</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="mb-2">📱 Open your crypto wallet and scan the QR code above</p>
                      <p className="mb-2">💰 Send exactly <strong>{nowPayment.pay_amount} {nowPayment.pay_currency.toUpperCase()}</strong></p>
                      <p>⏱️ Payment will be confirmed automatically</p>
                    </div>

                    <button
                      onClick={() => {
                        setNowPayment(null);
                        setPaymentStatus('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      ← Back to payment options
                    </button>
                  </div>
                </>
              )}
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                Powered by NOWPayments • 0.5% fee • 300+ cryptocurrencies • Production Mode
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}