'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function DevnetGuide() {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        🎮 Devnet Setup Guide
      </h3>

      <div className="space-y-4">
        {/* Step 1: Get Devnet SOL */}
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Step 1: Get Free Devnet SOL</h4>
          <p className="text-blue-800 text-sm mb-3">
            You need devnet SOL for transaction fees and liquidity.
          </p>
          
          {publicKey && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 text-xs">Your wallet address:</span>
                <button
                  onClick={copyAddress}
                  className="text-xs bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                >
                  {copied ? 'Copied!' : `${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-4)}`}
                </button>
              </div>
              
              <div className="space-y-2">
                <a
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700"
                >
                  Get SOL from Solana Faucet →
                </a>
                
                <p className="text-blue-700 text-xs">
                  💡 Alternative: Use <code>solana airdrop 2 {publicKey.toString().slice(0, 8)}...</code> in CLI
                </p>
              </div>
            </div>
          )}
          
          {!publicKey && (
            <p className="text-blue-700 text-xs">
              Connect your wallet first to see your devnet address.
            </p>
          )}
        </div>

        {/* Step 2: Deploy QTC Token */}
        <div className="border-l-4 border-green-500 bg-green-50 p-4">
          <h4 className="font-semibold text-green-900 mb-2">Step 2: Deploy QTC Token on Devnet</h4>
          <p className="text-green-800 text-sm mb-2">
            Your QTC token needs to be deployed on devnet for testing.
          </p>
          <div className="space-y-1 text-green-700 text-xs">
            <p>• Use SPL Token CLI or web interface</p>
            <p>• Set decimals to 9 (standard for most tokens)</p>
            <p>• Mint initial supply for testing</p>
            <p>• Current QTC address: <code>6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE</code></p>
          </div>
        </div>

        {/* Step 3: Get Devnet USDC */}
        <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Step 3: Get Devnet USDC</h4>
          <p className="text-purple-800 text-sm mb-2">
            For creating USDC/QTC pairs and testing.
          </p>
          <div className="space-y-1 text-purple-700 text-xs">
            <p>• Devnet USDC mint: <code>4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU</code></p>
            <p>• Use SPL Token Faucet or create token account manually</p>
            <p>• Mint some USDC for liquidity testing</p>
          </div>
        </div>

        {/* Step 4: Understanding the Process */}
        <div className="border-l-4 border-orange-500 bg-orange-50 p-4">
          <h4 className="font-semibold text-orange-900 mb-2">Step 4: Raydium Pool Creation Process</h4>
          <div className="space-y-1 text-orange-700 text-xs">
            <p>• <strong>OpenBook Market:</strong> Create market for price discovery</p>
            <p>• <strong>AMM Pool:</strong> Initialize Raydium pool with initial liquidity</p>
            <p>• <strong>Liquidity:</strong> Add your QTC and SOL/USDC to the pool</p>
            <p>• <strong>Trading:</strong> Once pool exists, anyone can swap tokens</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Implementation Status</h4>
          <div className="space-y-1 text-gray-600 text-sm">
            <p>✅ Wallet connection on devnet</p>
            <p>✅ UI for pool creation and swapping</p>
            <p>🔄 <strong>Next:</strong> Integrate actual Raydium SDK calls</p>
            <p>🔄 <strong>Next:</strong> Deploy and fund QTC token on devnet</p>
            <p>🔄 <strong>Next:</strong> Create real OpenBook market</p>
          </div>
        </div>
      </div>
    </div>
  );
}