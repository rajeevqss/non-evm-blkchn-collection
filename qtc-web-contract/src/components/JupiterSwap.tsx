'use client';

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { CustomWalletButton, WalletButtonStyles } from './WalletButton';

import { getCurrentNetworkConfig, CURRENT_NETWORK, NetworkEnvironment } from '../config/network';

// Token lists for different networks
const MAINNET_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    icon: '☀️',
    decimals: 9
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    icon: '💵',
    decimals: 6
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    icon: '💚',
    decimals: 6
  },
  {
    symbol: 'QTC',
    name: 'QTC Token',
    mint: '6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE',
    icon: '🪙',
    decimals: 9
  }
];

// For devnet, we still use mainnet token addresses for Jupiter quotes
// This allows price calculations even though actual swaps won't work
const DEVNET_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana (Quote Mode)',
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL (same on all networks)
    icon: '☀️',
    decimals: 9
  },
  {
    symbol: 'USDC',
    name: 'USDC (Quote Mode)',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Use mainnet USDC for quotes
    icon: '💵',
    decimals: 6
  },
  {
    symbol: 'USDT', 
    name: 'USDT (Quote Mode)',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Use mainnet USDT for quotes
    icon: '💚',
    decimals: 6
  },
  {
    symbol: 'BONK',
    name: 'BONK (Quote Mode)',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Use mainnet BONK for quotes
    icon: '🐶',
    decimals: 5
  }
];

// Select tokens based on current network
const POPULAR_TOKENS = CURRENT_NETWORK === NetworkEnvironment.MAINNET ? MAINNET_TOKENS : DEVNET_TOKENS;

interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
}

interface SwapResult {
  txid: string;
  inputAmount: number;
  outputAmount: number;
  fromToken: string;
  toToken: string;
}

export default function JupiterSwap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  
  const [fromToken, setFromToken] = useState(POPULAR_TOKENS[0]); // SOL
  const [toToken, setToToken] = useState(POPULAR_TOKENS[1]); // USDC
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastSwap, setLastSwap] = useState<SwapResult | null>(null);
  const [error, setError] = useState('');

  // Get quote from Jupiter API via our proxy
  const getQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsGettingQuote(true);
    setError('');
    
    try {
      const inputAmount = Math.floor(parseFloat(amount) * Math.pow(10, fromToken.decimals));
      
      // Always allow quotes - Jupiter API works for price calculations even if swaps don't work on devnet
      const response = await fetch(`/api/jupiter/quote?inputMint=${fromToken.mint}&outputMint=${toToken.mint}&amount=${inputAmount}&slippageBps=50`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Quote API error: ${response.statusText}`);
      }
      
      const quoteData = await response.json();
      setQuote(quoteData);
      
    } catch (error: any) {
      console.error('Error getting quote:', error);
      setError(`Failed to get quote: ${error.message}`);
    } finally {
      setIsGettingQuote(false);
    }
  };

  // Execute swap transaction (or mock for testing wallet flow)
  const executeSwap = async () => {
    if (!quote || !publicKey || !connected) return;

    setIsSwapping(true);
    setError('');

    try {
      console.log('🔄 Starting swap execution...');

      // Step 1: Get swap transaction from Jupiter
      const swapResponse = await fetch('/api/jupiter/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
        }),
      });

      if (!swapResponse.ok) {
        const errorData = await swapResponse.json();
        throw new Error(errorData.error || `Swap API error: ${swapResponse.statusText}`);
      }

      const { swapTransaction } = await swapResponse.json();
      console.log('✅ Got swap transaction from Jupiter');

      // Step 2: Deserialize transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      console.log('🔑 Transaction details:');
      console.log('- Transaction type:', transaction.constructor.name);
      console.log('- Message instructions count:', transaction.message.compiledInstructions.length);
      console.log('- Account keys count:', transaction.message.staticAccountKeys.length);
      
      console.log('🔑 Sending transaction to wallet...');
      
      // This will open Phantom wallet dialog
      const txid = await sendTransaction(transaction, connection, {
        skipPreflight: true, // Skip preflight to avoid RPC issues
        preflightCommitment: 'confirmed',
        maxRetries: 5,
      });

      console.log('📡 Transaction sent:', txid);
      console.log('✅ Wallet dialog should have appeared!');

      const outputAmount = parseInt(quote.outAmount) / Math.pow(10, toToken.decimals);
      
      const result: SwapResult = {
        txid: txid,
        inputAmount: parseFloat(amount),
        outputAmount: outputAmount,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol
      };

      setLastSwap(result);
      setAmount('');
      setQuote(null);

      alert(`✅ Swap Successful!
      
Swapped: ${result.inputAmount} ${result.fromToken}
Received: ${result.outputAmount.toFixed(6)} ${result.toToken}
Txn ID: ${result.txid}

View on Solscan: https://solscan.io/tx/${result.txid}`);

    } catch (error: any) {
      console.error('💥 Swap error:', error);
      
      // Better error handling for common issues
      let errorMessage = 'Swap failed';
      
      if (error.message.includes('User rejected') || error.message.includes('rejected') || error.message.includes('cancelled')) {
        errorMessage = '✅ Transaction cancelled by user (this is normal for testing!)';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for this transaction';
      } else if (error.message.includes('blockhash not found')) {
        errorMessage = 'Transaction expired. Please try again';
      } else if (error.message.includes('Transaction simulation failed')) {
        errorMessage = 'Transaction would fail. Check token balances and try a smaller amount';
      } else if (error.name === 'WalletSendTransactionError') {
        errorMessage = `Wallet error: ${error.message}. Try refreshing and reconnecting your wallet`;
      } else {
        errorMessage = `Swap failed: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  // Auto-get quote when amount changes (with longer debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0 && connected) {
        getQuote();
      } else {
        setQuote(null);
      }
    }, 1000); // Longer debounce to reduce API calls

    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken, connected]);

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
  };

  const outputAmount = quote ? (parseInt(quote.outAmount) / Math.pow(10, toToken.decimals)).toFixed(6) : '0';

  return (
    <>
      <WalletButtonStyles />
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
          🔄 Jupiter Token Swap
        </h3>
      
      {/* Network & Wallet Connection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-blue-500 text-lg mr-2">🔗</span>
            <div>
              <p className="text-blue-800 font-medium text-sm">
                {connected ? `Connected: ${publicKey?.toString().slice(0, 8)}...` : 'Wallet Not Connected'}
              </p>
              <p className="text-blue-700 text-xs">
                Network: <span className="font-medium">{getCurrentNetworkConfig().name}</span> • 
                {connected ? (
                  getCurrentNetworkConfig().hasJupiterSupport 
                    ? ' Ready for Jupiter swaps' 
                    : ' Limited swap support (Jupiter unavailable)'
                ) : ' Connect your wallet to start trading'}
              </p>
            </div>
          </div>
          <CustomWalletButton />
        </div>
      </div>



      {/* Swap Interface */}
      <div className="space-y-4">
        {/* From Token */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="flex items-center space-x-4">
            <select
              value={fromToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setFromToken(token);
              }}
              className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {POPULAR_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-3 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{fromToken.name}</p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Swap tokens"
          >
            ↕️
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="flex items-center space-x-4">
            <select
              value={toToken.symbol}
              onChange={(e) => {
                const token = POPULAR_TOKENS.find(t => t.symbol === e.target.value);
                if (token) setToToken(token);
              }}
              className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {POPULAR_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={isGettingQuote ? 'Loading...' : outputAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 px-3 py-2 text-lg bg-white border border-gray-300 rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{toToken.name}</p>
        </div>

        {/* Loading State */}
        {isGettingQuote && amount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="inline-block animate-spin mr-2">⏳</span>
              <span className="text-yellow-800 text-sm">Getting best quote from Jupiter...</span>
            </div>
          </div>
        )}

        {/* Quote Information */}
        {quote && !isGettingQuote && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Quote Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Rate:</span>
                <span className="text-blue-900">1 {fromToken.symbol} = {(parseInt(quote.outAmount) / parseInt(quote.inAmount) * Math.pow(10, fromToken.decimals - toToken.decimals)).toFixed(6)} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Price Impact:</span>
                <span className="text-blue-900">{parseFloat(quote.priceImpactPct).toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Slippage:</span>
                <span className="text-blue-900">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Route:</span>
                <span className="text-blue-900 text-xs">Via Jupiter Aggregator</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <div>
                <p className="text-red-800 text-sm font-medium">Quote Error</p>
                <p className="text-red-700 text-xs mt-1">{error}</p>
                {error.includes('No routes found') && (
                  <p className="text-red-600 text-xs mt-2">
                    💡 Try swapping between SOL, USDC, or USDT which have high liquidity.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={executeSwap}
          disabled={!quote || isSwapping || !amount || !connected}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !quote || isSwapping || !amount || !connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : getCurrentNetworkConfig().hasJupiterSupport 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          {!connected ? (
            'Connect Wallet to Swap'
          ) : isSwapping ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Swapping...
            </>
          ) : !getCurrentNetworkConfig().hasJupiterSupport ? (
            `View Quote Only (${getCurrentNetworkConfig().name})`
          ) : (
            `Swap ${fromToken.symbol} → ${toToken.symbol}`
          )}
        </button>
      </div>

      {/* Last Swap Result */}
      {lastSwap && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Last Swap</h4>
          <div className="text-sm space-y-1">
            <p className="text-green-800">
              ✅ Swapped {lastSwap.inputAmount} {lastSwap.fromToken} → {lastSwap.outputAmount.toFixed(6)} {lastSwap.toToken}
            </p>
            <p className="text-green-700 font-mono text-xs">
              Txn: {lastSwap.txid}
            </p>
            <p className="text-green-600 text-xs">
              <a 
                href={`https://solscan.io/tx/${lastSwap.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View on Solscan →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Jupiter Attribution */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by 🪐 <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jupiter</a> • Best rates across Solana
        </p>
        </div>
      </div>
    </>
  );
}