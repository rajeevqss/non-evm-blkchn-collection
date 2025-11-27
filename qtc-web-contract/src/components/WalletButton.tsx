'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import wallet components with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => {
    const { WalletMultiButton } = await import('@solana/wallet-adapter-react-ui');
    return { default: WalletMultiButton };
  },
  { 
    ssr: false,
    loading: () => (
      <button className="bg-purple-600 text-white text-sm py-2 px-4 rounded-lg font-medium hover:bg-purple-700">
        Loading...
      </button>
    )
  }
);

export function CustomWalletButton() {
  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButtonDynamic className="!bg-blue-600 !text-white !text-sm !py-2 !px-4 !rounded-lg !font-medium hover:!bg-blue-700 !border-none !outline-none" />
    </div>
  );
}

// Add CSS to ensure wallet modal appears correctly
export const WalletButtonStyles = () => (
  <style jsx global>{`
    .wallet-adapter-button-trigger {
      display: flex;
    }
    
    .wallet-adapter-button {
      background-color: #2563eb !important;
      color: white !important;
      border: none !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
      transition: background-color 0.2s !important;
    }
    
    .wallet-adapter-button:hover:not([disabled]) {
      background-color: #1d4ed8 !important;
    }
    
    .wallet-adapter-button[disabled] {
      background-color: #9ca3af !important;
      cursor: not-allowed !important;
    }
    
    .wallet-adapter-modal-wrapper {
      z-index: 9999 !important;
    }
    
    .wallet-adapter-modal-overlay {
      background-color: rgba(0, 0, 0, 0.5) !important;
    }
    
    .wallet-adapter-modal {
      background-color: white !important;
      border-radius: 12px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    }
    
    .wallet-adapter-modal-title {
      color: #1f2937 !important;
      font-weight: 600 !important;
    }
    
    .wallet-adapter-modal-list {
      padding: 0 !important;
    }
    
    .wallet-adapter-modal-list-item {
      border-radius: 8px !important;
      margin-bottom: 8px !important;
    }
    
    .wallet-adapter-modal-list-item:hover {
      background-color: #f3f4f6 !important;
    }
  `}</style>
);