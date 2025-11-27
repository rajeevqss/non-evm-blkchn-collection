'use client';

import React from 'react';

export default function DevnetSwapAlternatives() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        💡 Devnet Swap Alternatives
      </h3>
      
      <div className="space-y-4">
        {/* Direct DEX Integration */}
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Option 1: Direct DEX Integration</h4>
          <p className="text-blue-800 text-sm mb-2">
            Integrate directly with DEXs that support devnet:
          </p>
          <ul className="text-blue-700 text-xs space-y-1">
            <li>• <strong>Raydium Devnet</strong>: Create liquidity pools on devnet</li>
            <li>• <strong>Orca Devnet</strong>: Use Orca's devnet instance</li>
            <li>• <strong>Serum DEX</strong>: Direct order book trading</li>
          </ul>
        </div>

        {/* Mock Trading */}
        <div className="border-l-4 border-green-500 bg-green-50 p-4">
          <h4 className="font-semibold text-green-900 mb-2">Option 2: Simulated Trading</h4>
          <p className="text-green-800 text-sm mb-2">
            Create a mock trading environment for testing:
          </p>
          <ul className="text-green-700 text-xs space-y-1">
            <li>• <strong>Price Feeds</strong>: Use Pyth or Chainlink price oracles</li>
            <li>• <strong>Mock Swaps</strong>: Simulate swaps with real devnet tokens</li>
            <li>• <strong>Test Transactions</strong>: Real wallet interactions without Jupiter</li>
          </ul>
        </div>

        {/* Mainnet Testing */}
        <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Option 3: Mainnet with Small Amounts</h4>
          <p className="text-purple-800 text-sm mb-2">
            Test on mainnet with minimal funds:
          </p>
          <ul className="text-purple-700 text-xs space-y-1">
            <li>• <strong>Small Amounts</strong>: Test with $1-5 worth of tokens</li>
            <li>• <strong>Real Environment</strong>: Full Jupiter integration</li>
            <li>• <strong>Production Ready</strong>: Test actual user experience</li>
          </ul>
        </div>

        {/* Get Devnet Tokens */}
        <div className="border-l-4 border-orange-500 bg-orange-50 p-4">
          <h4 className="font-semibold text-orange-900 mb-2">Getting Devnet Tokens</h4>
          <p className="text-orange-800 text-sm mb-2">
            To test on devnet, you'll need devnet tokens:
          </p>
          <ul className="text-orange-700 text-xs space-y-1">
            <li>• <strong>SOL</strong>: Get from <a href="https://faucet.solana.com/" className="underline" target="_blank">Solana Faucet</a></li>
            <li>• <strong>USDC/USDT</strong>: Get from token faucets or create test tokens</li>
            <li>• <strong>Your Token</strong>: Deploy your token on devnet first</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">
          <strong>Recommendation:</strong> For development, use Option 1 (direct DEX) or Option 2 (simulation). 
          For pre-production testing, use Option 3 (mainnet with small amounts).
        </p>
      </div>
    </div>
  );
}