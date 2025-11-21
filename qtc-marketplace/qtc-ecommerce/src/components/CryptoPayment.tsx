'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface PaymentOrder {
  id: number;
  orderId: string;
  status: string;
  amount: string;
  currency: string;
  payAmount: string;
  payCurrency: string;
  paymentAddress: string;
  paymentUrl: string;
  qrCodeUrl?: string;
  expiresAt: string;
  token: string;
  createdAt: string;
}

interface CryptoPaymentProps {
  amount: number;
  currency: string;
  description?: string;
  onSuccess?: (order: PaymentOrder) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'BTC', name: 'Bitcoin', icon: '₿' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { code: 'SOL', name: 'Solana', icon: '◎' },
  { code: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { code: 'BCH', name: 'Bitcoin Cash', icon: '₿' },
  { code: 'ADA', name: 'Cardano', icon: '₳' },
  { code: 'DOT', name: 'Polkadot', icon: '●' },
  { code: 'USDT', name: 'Tether', icon: '₮' },
  { code: 'USDC', name: 'USD Coin', icon: '$' },
];

export default function CryptoPayment({ 
  amount, 
  currency, 
  description, 
  onSuccess, 
  onError, 
  onCancel 
}: CryptoPaymentProps) {
  console.log('CryptoPayment component rendered with:', { amount, currency, description });
  const [selectedCrypto, setSelectedCrypto] = useState('SOL');
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isDemoQR, setIsDemoQR] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired' | 'error'>('pending');

  // Debug QR code state
  console.log('Current QR code state:', qrCodeDataUrl ? 'HAS QR CODE' : 'NO QR CODE');
  console.log('QR code data length:', qrCodeDataUrl.length);
  console.log('Is demo QR?', isDemoQR);
  console.log('Payment order exists?', !!paymentOrder);

  // Create payment order
  const createPaymentOrder = async () => {
    setIsCreatingOrder(true);
    setIsDemoQR(false); // Clear demo mode when creating real order
    try {
      const response = await fetch('/api/coingate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          callbackUrl: `${window.location.origin}/api/coingate/webhook`,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      setPaymentOrder(data.order);
      
      // Always try to generate QR code first (using payment URL if address not available)
      console.log('Order created, generating QR code...');
      await generateQRCode(data.order);
      
      // Start checking payment status
      startStatusPolling(data.order.id);
      
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      onError?.(error.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Generate QR code for payment
  const generateQRCode = async (order: PaymentOrder) => {
    console.log('Generating QR code for order:', order);
    try {
      // First, try to generate a proper wallet QR code if we have payment details
      if (order.paymentAddress && order.payAmount) {
        console.log('Generating wallet-compatible QR code...');
        
        // Create payment URI for QR code
        let paymentUri = '';
        
        switch (order.payCurrency.toLowerCase()) {
          case 'btc':
            paymentUri = `bitcoin:${order.paymentAddress}?amount=${order.payAmount}`;
            break;
          case 'eth':
            paymentUri = `ethereum:${order.paymentAddress}?value=${order.payAmount}`;
            break;
          case 'ltc':
            paymentUri = `litecoin:${order.paymentAddress}?amount=${order.payAmount}`;
            break;
          case 'sol':
            paymentUri = `solana:${order.paymentAddress}?amount=${order.payAmount}&spl-token=sol`;
            break;
          default:
            paymentUri = `${order.payCurrency.toLowerCase()}:${order.paymentAddress}?amount=${order.payAmount}`;
        }

        console.log('Payment URI for wallet:', paymentUri);

        const qrCode = await QRCode.toDataURL(paymentUri, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        
        console.log('Wallet-compatible QR code generated successfully');
        setQrCodeDataUrl(qrCode);
        return;
      }

      // Fallback: Generate QR code with payment URL for manual opening
      if (order.paymentUrl) {
        console.log('Generating fallback QR code with payment URL:', order.paymentUrl);
        
        const qrCode = await QRCode.toDataURL(order.paymentUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        
        console.log('Fallback QR code generated successfully');
        setQrCodeDataUrl(qrCode);
        return;
      }

      console.warn('No payment details available for wallet QR code');
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Show error message to user
      onError?.('Failed to generate QR code. Please try again.');
    }
  };

  // Poll payment status
  const startStatusPolling = (orderId: number) => {
    const interval = setInterval(async () => {
      try {
        setIsCheckingStatus(true);
        const response = await fetch(`/api/coingate?id=${orderId}`);
        const data = await response.json();

        if (data.success) {
          const order = data.order;
          setPaymentOrder(order);

          // If payment details just became available, generate QR code
          if (order.paymentAddress && order.payAmount && !qrCodeDataUrl) {
            console.log('Payment details now available, generating QR code...');
            await generateQRCode(order);
          }

          if (order.status === 'paid' || order.status === 'confirmed') {
            setPaymentStatus('paid');
            clearInterval(interval);
            onSuccess?.(order);
          } else if (order.status === 'expired' || order.status === 'canceled') {
            setPaymentStatus('expired');
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    }, 5000); // Check every 5 seconds

    // Clear interval after 30 minutes
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  // Countdown timer
  useEffect(() => {
    if (paymentOrder?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(paymentOrder.expiresAt).getTime();
        const remaining = Math.max(0, expiry - now);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setPaymentStatus('expired');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentOrder?.expiresAt]);

  // Format countdown time
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (!paymentOrder) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          💰 Pay with Crypto (CoinGate)
        </h2>
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <p className="text-green-800 text-sm">✅ CoinGate component loaded successfully</p>
        </div>

        {/* Debug Info for Demo QR */}
        {qrCodeDataUrl && (
          <div className="text-center mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-xs">
                🔍 Debug: QR Data = {qrCodeDataUrl.slice(0, 50)}... | 
                Length = {qrCodeDataUrl.length} | 
                Demo = {isDemoQR ? 'YES' : 'NO'}
              </p>
            </div>
          </div>
        )}

        {/* Demo QR Code Display */}
        {qrCodeDataUrl && isDemoQR && (
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white border-2 border-green-500 rounded-lg">
              <div className="bg-green-100 border border-green-300 rounded p-2 mb-2">
                <p className="text-green-800 text-xs font-medium">✅ Demo QR Code Generated!</p>
              </div>
              <img src={qrCodeDataUrl} alt="Demo Payment QR Code" className="w-48 h-48 mb-2" />
              <p className="text-xs text-gray-600">
                👻 Demo QR: Scan with Phantom to test (0.1 SOL)
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Amount to pay:</p>
          <p className="text-3xl font-bold text-blue-600">
            ${amount} {currency}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Cryptocurrency:
          </label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SUPPORTED_CURRENCIES.map((crypto) => (
              <option key={crypto.code} value={crypto.code}>
                {crypto.icon} {crypto.name} ({crypto.code})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={createPaymentOrder}
          disabled={isCreatingOrder}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isCreatingOrder
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isCreatingOrder ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Creating Payment Order...
            </>
          ) : (
            `Generate QR Code (${selectedCrypto})`
          )}
        </button>

        {/* Real Wallet Address QR */}
        <button
          onClick={async () => {
            console.log('🔄 Generating real wallet address QR...');
            try {
              // Use a known valid Solana address (Solana Foundation's address)
              const realAddress = 'So11111111111111111111111111111111111111112'; // Wrapped SOL address
              
              console.log('📍 Creating real address QR:', realAddress);
              
              const addressQR = await QRCode.toDataURL(realAddress, {
                width: 256,
                margin: 2,
                errorCorrectionLevel: 'M',
              });
              
              setQrCodeDataUrl(addressQR);
              setIsDemoQR(true);
              console.log('✅ Real address QR generated!');
              
            } catch (error) {
              console.error('❌ Error generating address QR:', error);
            }
          }}
          className="w-full mt-2 py-2 px-4 text-sm bg-green-200 hover:bg-green-300 rounded-lg transition-colors"
        >
          💰 Generate Real Solana Address QR
        </button>

        {/* Your Own Wallet QR */}
        <button
          onClick={async () => {
            console.log('🔄 Generating your wallet address QR...');
            const userAddress = prompt('Enter your Solana wallet address (from Phantom):');
            if (!userAddress) return;
            
            try {
              console.log('👤 Creating your wallet QR:', userAddress);
              
              const walletQR = await QRCode.toDataURL(userAddress.trim(), {
                width: 256,
                margin: 2,
                errorCorrectionLevel: 'M',
              });
              
              setQrCodeDataUrl(walletQR);
              setIsDemoQR(true);
              console.log('✅ Your wallet QR generated!');
              
            } catch (error) {
              console.error('❌ Error generating wallet QR:', error);
            }
          }}
          className="w-full mt-1 py-2 px-4 text-xs bg-blue-200 hover:bg-blue-300 rounded-lg transition-colors"
        >
          👤 Generate QR with Your Address
        </button>

        {/* Web URL Test */}
        <button
          onClick={async () => {
            console.log('🔄 Generating web URL QR...');
            try {
              // Simple web URL that should work
              const testUrl = 'https://phantom.app';
              
              console.log('🌐 Creating web URL QR:', testUrl);
              
              const urlQR = await QRCode.toDataURL(testUrl, {
                width: 256,
                margin: 2,
                errorCorrectionLevel: 'M',
              });
              
              setQrCodeDataUrl(urlQR);
              setIsDemoQR(true);
              console.log('✅ Web URL QR generated!');
              
            } catch (error) {
              console.error('❌ Error generating URL QR:', error);
            }
          }}
          className="w-full mt-1 py-2 px-4 text-xs bg-orange-200 hover:bg-orange-300 rounded-lg transition-colors"
        >
          🌐 Test with Simple URL
        </button>

        {/* Debug button for testing QR generation */}
        <button
          onClick={async () => {
            try {
              console.log('Testing QR generation...');
              const testQR = await QRCode.toDataURL('test-address-12345', {
                width: 256,
                margin: 2,
                errorCorrectionLevel: 'M',
              });
              setQrCodeDataUrl(testQR);
              console.log('Test QR generated successfully');
            } catch (error) {
              console.error('Test QR generation failed:', error);
            }
          }}
          className="w-full mt-2 py-2 px-4 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          🧪 Test Basic QR
        </button>

        {onCancel && (
          <button
            onClick={() => {
              // Reset component state
              setPaymentOrder(null);
              setQrCodeDataUrl('');
              setIsDemoQR(false);
              setPaymentStatus('pending');
              // Call parent cancel function
              onCancel();
            }}
            className="w-full mt-3 py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📱 {isDemoQR ? 'Demo Payment QR' : 'Scan to Pay'}
        </h2>
        <div className="flex items-center justify-center space-x-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            paymentStatus === 'paid' ? 'bg-green-500' : 
            paymentStatus === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></span>
          <span className="text-sm text-gray-600">
            {isDemoQR ? 'Demo Mode Active' :
             paymentStatus === 'paid' ? 'Payment Received' :
             paymentStatus === 'expired' ? 'Payment Expired' : 'Waiting for Payment'}
          </span>
          {isCheckingStatus && <span className="animate-spin">⟳</span>}
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-center mb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-yellow-800 text-xs">
            🔍 Debug: QR Data = {qrCodeDataUrl ? `${qrCodeDataUrl.slice(0, 50)}...` : 'EMPTY'} | 
            Length = {qrCodeDataUrl.length} | 
            Demo = {isDemoQR ? 'YES' : 'NO'}
          </p>
        </div>
      </div>

      {/* QR Code - Always show if qrCodeDataUrl exists */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          {qrCodeDataUrl && qrCodeDataUrl.length > 0 ? (
            <div className="text-center">
              <div className="bg-green-100 border border-green-300 rounded p-2 mb-2">
                <p className="text-green-800 text-xs font-medium">✅ QR Code Generated!</p>
              </div>
              <img src={qrCodeDataUrl} alt="Payment QR Code" className="w-48 h-48 mb-2" />
              <p className="text-xs text-gray-600">
                {isDemoQR ? 
                  '👻 Demo QR: Scan with Phantom to test (0.1 SOL)' :
                  paymentOrder?.paymentAddress ? 
                    `Scan to pay ${paymentOrder.payAmount} ${paymentOrder.payCurrency}` :
                    'Scan to open CoinGate payment page'
                }
              </p>
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-center p-4">
                  <div className="mb-4">
                    <div className="text-4xl mb-2">{isDemoQR ? '👻' : '⚠️'}</div>
                    <span className="text-gray-600 text-sm">
                      {isDemoQR ? 'No demo QR generated yet...' : 'CoinGate sandbox is processing...'}
                    </span>
                  </div>
                  {paymentOrder && !isDemoQR && (
                    <div className="space-y-2">
                      <a
                        href={paymentOrder.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        🔗 Open CoinGate Payment Page
                      </a>
                      <button
                        onClick={async () => {
                          console.log('Manual refresh requested...');
                          try {
                            const response = await fetch(`/api/coingate?id=${paymentOrder.id}`);
                            const data = await response.json();
                            console.log('Manual refresh response:', data);
                            if (data.success && data.order.paymentAddress) {
                              setPaymentOrder(data.order);
                              await generateQRCode(data.order);
                            }
                          } catch (error) {
                            console.error('Manual refresh failed:', error);
                          }
                        }}
                        className="w-full py-2 px-4 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      >
                        🔄 Check for QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Details:
          </label>
          <div className="p-3 bg-gray-50 rounded border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{paymentOrder.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">${paymentOrder.amount} {paymentOrder.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold capitalize">{paymentOrder.status}</span>
            </div>
            {paymentOrder.payAmount && paymentOrder.payCurrency && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pay Amount:</span>
                <span className="font-semibold">{paymentOrder.payAmount} {paymentOrder.payCurrency}</span>
              </div>
            )}
            {paymentOrder.paymentAddress && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Address:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs break-all">{paymentOrder.paymentAddress}</span>
                  <button
                    onClick={() => copyToClipboard(paymentOrder.paymentAddress, 'Address')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        {timeRemaining > 0 && (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⏰ Payment expires in: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </p>
          </div>
        )}

        {/* Status Messages */}
        {paymentStatus === 'paid' && (
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✅ Payment received! Processing your order...
            </p>
          </div>
        )}

        {paymentStatus === 'expired' && (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">
              ❌ Payment expired. Please create a new payment.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <a
          href={paymentOrder.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💳 Complete Payment with CoinGate
        </a>
        
        <div className="text-center text-xs text-gray-500">
          Click above to open CoinGate's secure payment page where you can pay with any crypto wallet
        </div>
        
        {onCancel && (
          <button
            onClick={() => {
              // Reset component state
              setPaymentOrder(null);
              setQrCodeDataUrl('');
              setIsDemoQR(false);
              setPaymentStatus('pending');
              // Call parent cancel function
              onCancel();
            }}
            className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel Payment
          </button>
        )}
      </div>
    </div>
  );
}