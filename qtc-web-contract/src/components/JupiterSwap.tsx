'use client';

import React, { useState, useEffect } from 'react';

// Popular Solana tokens for swapping
const POPULAR_TOKENS = [
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
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    icon: '🐶',
    decimals: 5
  },
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    icon: '🐕',
    decimals: 6
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    icon: '🪐',
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
      
      // Use our local API route instead of calling Jupiter directly
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

  // Simulate swap (for demo purposes - real implementation would use Jupiter swap API)
  const executeSwap = async () => {
    if (!quote) return;

    setIsSwapping(true);
    setError('');

    try {
      // Simulate swap execution (in real implementation, you'd use Jupiter's swap API)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      const outputAmount = parseInt(quote.outAmount) / Math.pow(10, toToken.decimals);
      
      const result: SwapResult = {
        txid: `demo_tx_${Date.now()}`, // In real app, this would be actual transaction ID
        inputAmount: parseFloat(amount),
        outputAmount: outputAmount,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol
      };

      setLastSwap(result);
      setAmount('');
      setQuote(null);

      alert(`✅ Swap Successful! (Demo Mode)
      
Swapped: ${result.inputAmount} ${result.fromToken}
Received: ${result.outputAmount.toFixed(6)} ${result.toToken}
Txn ID: ${result.txid}

Note: This is a demo. Real swaps require wallet connection and actual tokens.`);

    } catch (error: any) {
      console.error('Swap error:', error);
      setError(`Swap failed: ${error.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  // Auto-get quote when amount changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        getQuote();
      } else {
        setQuote(null);
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken]);

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
  };

  const outputAmount = quote ? (parseInt(quote.outAmount) / Math.pow(10, toToken.decimals)).toFixed(6) : '0';

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
        🔄 Jupiter Token Swap
      </h3>
      
      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-yellow-500 text-lg mr-2">⚠️</span>
          <div>
            <p className="text-yellow-800 font-medium text-sm">Demo Mode Active</p>
            <p className="text-yellow-700 text-xs">Quotes are real from Jupiter API, but swaps are simulated. Connect wallet for real trading.</p>
          </div>
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
          disabled={!quote || isSwapping || !amount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !quote || isSwapping || !amount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSwapping ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Swapping...
            </>
          ) : (
            `Swap ${fromToken.symbol} → ${toToken.symbol}`
          )}
        </button>
      </div>

      {/* Last Swap Result */}
      {lastSwap && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Last Swap (Demo)</h4>
          <div className="text-sm space-y-1">
            <p className="text-green-800">
              ✅ Swapped {lastSwap.inputAmount} {lastSwap.fromToken} → {lastSwap.outputAmount.toFixed(6)} {lastSwap.toToken}
            </p>
            <p className="text-green-700 font-mono text-xs">
              Txn: {lastSwap.txid}
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
  );
}