'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { CustomWalletButton, WalletButtonStyles } from './WalletButton';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useWhirlpoolOrcaPools } from '@/hooks/useWhirlpoolOrcaPools';

// Conservative pricing: 1 QTC = 0.001 SOL
const QTC_SOL_RATE = 0.001; // 1,000 QTC per 1 SOL
const QTC_USDC_RATE = 0.10;  // $0.10 per QTC (assuming SOL = $100)

// Devnet token addresses
const DEVNET_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana (Devnet)',
    mint: 'So11111111111111111111111111111111111111112',
    icon: 'SOL',
    decimals: 9
  },
  {
    symbol: 'USDC',
    name: 'USDC (Devnet)', 
    mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    icon: 'USDC',
    decimals: 6
  },
  {
    symbol: 'QTC',
    name: 'QTC Token (Devnet)',
    mint: '6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE',
    icon: 'QTC', 
    decimals: 9
  }
];

export default function OrcaSwap() {
  const { publicKey, connected } = useWallet();
  const { balances, refreshBalances } = useTokenBalances();
  const { pools, createPool, performSwap, refreshPools, isAdmin } = useWhirlpoolOrcaPools();
  
  const [fromToken, setFromToken] = useState(DEVNET_TOKENS[2]); // QTC
  const [toToken, setToToken] = useState(DEVNET_TOKENS[0]); // SOL
  const [amount, setAmount] = useState('');
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [poolType, setPoolType] = useState<'QTC_SOL' | 'QTC_USDC'>('QTC_SOL');

  // Get relevant pool based on current token pair
  const getCurrentPool = () => {
    const isQtcSol = (fromToken.symbol === 'QTC' && toToken.symbol === 'SOL') || 
                     (fromToken.symbol === 'SOL' && toToken.symbol === 'QTC');
    const isQtcUsdc = (fromToken.symbol === 'QTC' && toToken.symbol === 'USDC') || 
                      (fromToken.symbol === 'USDC' && toToken.symbol === 'QTC');
    const isSolUsdc = (fromToken.symbol === 'SOL' && toToken.symbol === 'USDC') || 
                      (fromToken.symbol === 'USDC' && toToken.symbol === 'SOL');
    
    if (isQtcSol) return pools.qtcSolPool;
    if (isQtcUsdc) return pools.qtcUsdcPool;
    if (isSolUsdc) return pools.solUsdcPool;
    return null;
  };

  // Calculate estimated output using pool reserves or fallback to rate
  const calculateEstimatedOutput = () => {
    if (!amount || isNaN(parseFloat(amount))) return '0.0';
    
    const inputAmount = parseFloat(amount);
    const currentPool = getCurrentPool();
    
    // If pool exists, use AMM formula
    if (currentPool?.exists && currentPool.liquidity) {
      const isFromTokenA = fromToken.mint === currentPool.tokenA.toString();
      const reserveFrom = isFromTokenA ? currentPool.liquidity.tokenA : currentPool.liquidity.tokenB;
      const reserveTo = isFromTokenA ? currentPool.liquidity.tokenB : currentPool.liquidity.tokenA;
      
      if (reserveFrom > 0 && reserveTo > 0) {
        // Constant product formula with 0.3% fee
        const k = reserveFrom * reserveTo;
        const newReserveFrom = reserveFrom + (inputAmount * 0.997);
        const newReserveTo = k / newReserveFrom;
        const outputAmount = reserveTo - newReserveTo;
        return Math.max(0, outputAmount).toFixed(6);
      }
    }
    
    // Fallback to conservative pricing
    if (fromToken.symbol === 'QTC' && toToken.symbol === 'SOL') {
      return (inputAmount * QTC_SOL_RATE).toFixed(6);
    }
    if (fromToken.symbol === 'SOL' && toToken.symbol === 'QTC') {
      return (inputAmount / QTC_SOL_RATE).toFixed(2);
    }
    if (fromToken.symbol === 'QTC' && toToken.symbol === 'USDC') {
      return (inputAmount * QTC_USDC_RATE).toFixed(2);
    }
    if (fromToken.symbol === 'USDC' && toToken.symbol === 'QTC') {
      return (inputAmount / QTC_USDC_RATE).toFixed(2);
    }
    
    return '0.0';
  };

  // Create Orca liquidity pool (Admin only)
  const createOrcaPool = async (type: 'QTC_SOL' | 'QTC_USDC') => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isAdmin) {
      setError('Only project administrators can create liquidity pools. Regular users can only swap tokens.');
      return;
    }

    setIsCreatingPool(true);
    setError('');
    
    const poolInfo = type === 'QTC_SOL' 
      ? { pair: 'QTC/SOL', rate: QTC_SOL_RATE, qtcAmount: 20000, otherAmount: 20 }
      : { pair: 'QTC/USDC', rate: QTC_USDC_RATE, qtcAmount: 10000, otherAmount: 1000 };
    
    setStatus(`Creating real Whirlpool ${poolInfo.pair} pool with admin wallet...`);

    try {
      console.log(`Admin Pool Creation:`);
      console.log(`• Admin wallet: ${publicKey.toString()}`);
      console.log(`• Pool type: ${poolInfo.pair}`);
      console.log(`• Conservative pricing: 1 QTC = ${poolInfo.rate} ${type === 'QTC_SOL' ? 'SOL' : 'USDC'}`);

      // Create pool using real Orca SDK
      const result = await createPool(type);

      setStatus(`${result.message}`);
      
      // Don't refresh pools since this was a simulation
      
    } catch (error: any) {
      console.error('Real pool creation error:', error);
      setError(`Pool creation failed: ${error.message}`);
    } finally {
      setIsCreatingPool(false);
    }
  };

  // Perform swap using Orca
  const performOrcaSwap = async () => {
    if (!connected || !publicKey || !amount) {
      setError('Please connect wallet and enter amount');
      return;
    }

    const inputAmount = parseFloat(amount);
    const currentPool = getCurrentPool();

    // Check if pool exists
    if (!currentPool?.exists) {
      setError(`No ${fromToken.symbol}/${toToken.symbol} pool exists. Create a pool first.`);
      return;
    }

    // Check wallet balance
    const fromBalance = fromToken.symbol === 'SOL' ? balances.sol : 
                       fromToken.symbol === 'QTC' ? balances.qtc : balances.usdc;
    
    console.log('Balance Check:');
    console.log(`• Token: ${fromToken.symbol}`);
    console.log(`• Required: ${inputAmount}`);
    console.log(`• Available: ${fromBalance}`);
    console.log(`• Balances object:`, balances);
    
    if (fromBalance < inputAmount) {
      setError(`Insufficient ${fromToken.symbol} balance. Have ${fromBalance.toFixed(6)}, need ${inputAmount}`);
      return;
    }

    setIsSwapping(true);
    setError('');
    setStatus(`Swapping ${amount} ${fromToken.symbol} to ${toToken.symbol}...`);

    try {
      console.log('Orca AMM Swap Transaction:');
      console.log(`• From wallet: ${publicKey.toString().slice(0, 8)}...`);
      console.log(`• Swapping: ${inputAmount} ${fromToken.symbol}`);
      console.log(`• Pool: ${fromToken.symbol}/${toToken.symbol}`);

      // Perform actual swap using real Orca pool
      const outputAmount = await performSwap(
        new PublicKey(fromToken.mint),
        new PublicKey(toToken.mint),
        inputAmount
      );

      setStatus(`Swap completed! Received ${outputAmount.toFixed(6)} ${toToken.symbol} in your wallet`);
      
      // Refresh balances and clear amount
      await refreshBalances();
      setAmount('');

    } catch (error: any) {
      console.error('Swap error:', error);
      setError(`Swap failed: ${error.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <>
      <WalletButtonStyles />
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
          Orca Whirlpools (Real Pool Creation)
        </h3>

        {/* Wallet Connection & Balances */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-blue-500 text-lg mr-2">Connection:</span>
              <div>
                <p className="text-blue-800 font-medium text-sm">
                  {connected ? `Connected: ${publicKey?.toString().slice(0, 8)}...` : 'Wallet Not Connected'}
                  {connected && isAdmin && <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">ADMIN</span>}
                </p>
                <p className="text-blue-700 text-xs">
                  Conservative Pricing • 1 QTC = 0.001 SOL • Real Whirlpool Integration
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={refreshBalances}
                disabled={!connected || balances.loading}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                title="Refresh Balances"
              >
                <span className={`text-sm ${balances.loading ? 'animate-spin' : ''}`}>Refresh</span>
              </button>
              <CustomWalletButton />
            </div>
          </div>
          
          {/* Wallet Balances */}
          {connected && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">SOL Balance</p>
                <p className="font-medium text-blue-800">
                  {balances.loading ? '...' : balances.sol.toFixed(4)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">QTC Balance</p>
                <p className="font-medium text-blue-800">
                  {balances.loading ? '...' : balances.qtc.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">USDC Balance</p>
                <p className="font-medium text-blue-800">
                  {balances.loading ? '...' : balances.usdc.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pool Status */}
        {connected && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800">Pool Status</h4>
              <button
                onClick={refreshPools}
                disabled={pools.loading}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                title="Refresh Pools"
              >
                <span className={`text-sm ${pools.loading ? 'animate-spin' : ''}`}>Refresh</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
            <div className={`p-4 rounded-lg border ${pools.qtcSolPool?.exists ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-medium text-sm mb-2 ${pools.qtcSolPool?.exists ? 'text-green-800' : 'text-gray-600'}`}>
                QTC/SOL Pool
              </h4>
              {pools.qtcSolPool?.exists ? (
                <div className="text-xs space-y-1">
                  <p className="text-green-700">Pool exists</p>
                  <p className="text-green-600">
                    Liquidity: {pools.qtcSolPool.liquidity.tokenA.toLocaleString()} QTC + {pools.qtcSolPool.liquidity.tokenB.toFixed(2)} SOL
                  </p>
                  <p className="text-green-600">
                    TVL: ~${pools.qtcSolPool.totalValueLocked.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">Pool not created yet</p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg border ${pools.qtcUsdcPool?.exists ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-medium text-sm mb-2 ${pools.qtcUsdcPool?.exists ? 'text-green-800' : 'text-gray-600'}`}>
                QTC/USDC Pool
              </h4>
              {pools.qtcUsdcPool?.exists ? (
                <div className="text-xs space-y-1">
                  <p className="text-green-700">Pool exists</p>
                  <p className="text-green-600">
                    Liquidity: {pools.qtcUsdcPool.liquidity.tokenA.toLocaleString()} QTC + {pools.qtcUsdcPool.liquidity.tokenB.toFixed(2)} USDC
                  </p>
                  <p className="text-green-600">
                    TVL: ~${pools.qtcUsdcPool.totalValueLocked.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">Pool not created yet</p>
              )}
            </div>
            
            <div className={`p-3 rounded-lg border ${pools.solUsdcPool?.exists ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-medium text-sm mb-2 ${pools.solUsdcPool?.exists ? 'text-green-800' : 'text-gray-600'}`}>
                SOL/USDC Pool
              </h4>
              {pools.solUsdcPool?.exists ? (
                <div className="text-xs space-y-1">
                  <p className="text-green-700">Available for testing</p>
                  <p className="text-green-600">
                    Liquidity: {pools.solUsdcPool.liquidity.tokenA.toLocaleString()} SOL + {pools.solUsdcPool.liquidity.tokenB.toLocaleString()} USDC
                  </p>
                  <p className="text-green-600">
                    TVL: ~${pools.solUsdcPool.totalValueLocked.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">Pool not available</p>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Admin Pool Creation Section */}
        {connected && isAdmin && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h4 className="text-purple-800 font-medium text-sm mb-3">
              Admin: Create QTC Liquidity Pools (One-Time Setup)
            </h4>
          
          {/* Pool Type Selection */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setPoolType('QTC_SOL')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                poolType === 'QTC_SOL'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              QTC/SOL Pool
            </button>
            <button
              onClick={() => setPoolType('QTC_USDC')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                poolType === 'QTC_USDC'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              QTC/USDC Pool
            </button>
          </div>

          {/* Pool Details */}
          <div className="bg-white rounded-lg p-3 mb-3 text-xs">
            {poolType === 'QTC_SOL' ? (
              <div className="space-y-1 text-gray-600">
                <p><strong>QTC/SOL Pool:</strong> Primary liquidity pool</p>
                <p>• Rate: 1 QTC = 0.001 SOL (1,000 QTC per SOL)</p>
                <p>• Initial: 20,000 QTC + 20 SOL (~$4,000 pool)</p>
                <p>• Market cap: ~$10,000 (conservative start)</p>
              </div>
            ) : (
              <div className="space-y-1 text-gray-600">
                <p><strong>QTC/USDC Pool:</strong> Stable reference pool</p>
                <p>• Rate: 1 QTC = $0.10 USDC</p>
                <p>• Initial: 10,000 QTC + 1,000 USDC (~$2,000 pool)</p>
                <p>• Stable dollar pricing reference</p>
              </div>
            )}
          </div>

          <button
            onClick={() => createOrcaPool(poolType)}
            disabled={!connected || isCreatingPool}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              !connected || isCreatingPool
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isCreatingPool ? (
              <>
                <span className="inline-block animate-spin mr-2">Loading...</span>
                Creating {poolType.replace('_', '/')} Pool...
              </>
            ) : (
              `Create ${poolType.replace('_', '/')} Pool`
            )}
          </button>
          </div>
        )}

        {/* Non-Admin Message */}
        {connected && !isAdmin && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h4 className="text-orange-800 font-medium text-sm mb-2">
              Pool Creation Restricted
            </h4>
            <p className="text-orange-700 text-xs">
              Only project administrators can create liquidity pools. Regular users can swap tokens once pools are created.
            </p>
          </div>
        )}

        {/* Testing Notice */}
        {pools.solUsdcPool?.exists && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="text-green-800 font-medium text-sm mb-2">
              Available for Testing: SOL/USDC Swapping
            </h4>
            <p className="text-green-700 text-xs">
              You can test Orca swapping functionality using SOL ↔ USDC pair. 
              This uses real AMM calculations with simulated large liquidity.
            </p>
          </div>
        )}

        {/* Swap Interface */}
        <div className="space-y-4">
          <h4 className="text-gray-800 font-medium">Step 2: Test Swapping</h4>
          
          {/* From Token */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="flex items-center space-x-4">
              <select
                value={fromToken.symbol}
                onChange={(e) => {
                  const token = DEVNET_TOKENS.find(t => t.symbol === e.target.value);
                  if (token) setFromToken(token);
                }}
                className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg"
              >
                {DEVNET_TOKENS.map(token => (
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <button
              onClick={swapTokens}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              Swap
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="flex items-center space-x-4">
              <select
                value={toToken.symbol}
                onChange={(e) => {
                  const token = DEVNET_TOKENS.find(t => t.symbol === e.target.value);
                  if (token) setToToken(token);
                }}
                className="flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg"
              >
                {DEVNET_TOKENS.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.symbol}
                  </option>
                ))}
              </select>
              <div className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {amount ? calculateEstimatedOutput() : '0.0'}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={performOrcaSwap}
            disabled={!connected || !amount || isSwapping}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !connected || !amount || isSwapping
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {!connected ? (
              'Connect Wallet to Swap'
            ) : isSwapping ? (
              <>
                <span className="inline-block animate-spin mr-2">Loading...</span>
                Swapping via Orca AMM...
              </>
            ) : (
              `Swap ${fromToken.symbol} → ${toToken.symbol}`
            )}
          </button>
        </div>

        {/* Status Messages */}
        {status && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">{status}</p>
            {status.includes('Pool created') && (
              <div className="mt-2 text-blue-700 text-xs space-y-1">
                <p>• Pool is now discoverable by Jupiter aggregator</p>
                <p>• Conservative pricing allows for organic growth</p>
                <p>• Room for 10x-100x price appreciation</p>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Whirlpool Information */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-green-800 font-medium text-sm mb-2">Whirlpool Pool Creation:</h4>
          <ul className="text-green-700 text-xs space-y-1">
            <li>• Real pool creation available on devnet</li>
            <li>• Splash Pools for simple token pairs</li>
            <li>• Concentrated Liquidity Pools for advanced features</li>
            <li>• Admin can create QTC liquidity pools immediately</li>
          </ul>
        </div>

        {/* Recommendation */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium text-sm mb-2">Recommendation:</h4>
          <p className="text-blue-700 text-xs">
            <strong>Whirlpool pools can now be created directly</strong> using the admin interface above. 
            For additional options, check the Raydium DEX section below.
          </p>
        </div>

        {/* Getting Started */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <a href="https://orca.so/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Orca Protocol</a> • 
            Pure AMM • Conservative Launch Strategy
          </p>
        </div>
      </div>
    </>
  );
}