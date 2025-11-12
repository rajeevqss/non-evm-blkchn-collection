'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletInfo } from '@/components/WalletConnect';
import { useEffect, useState } from 'react';
import { getQTCBalance } from '@/lib/solana';

export default function AccountPage() {
  const { publicKey, connected } = useWallet();
  const [qtcBalance, setQtcBalance] = useState<number>(0);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (connected && publicKey) {
      getQTCBalance(publicKey).then(setQtcBalance);
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Account</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to view your account</p>
        <WalletInfo />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Wallet Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Wallet Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Wallet Address</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {publicKey?.toString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">QTC Balance</label>
              <p className="text-2xl font-bold text-blue-600">{qtcBalance} QTC</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Network</label>
              <p className="text-green-600 font-semibold">Solana Devnet</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View Transaction History
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Export Wallet Data
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
              Get More QTC Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="text-gray-600 text-center py-8">
          No orders yet. <a href="/products" className="text-blue-600 hover:underline">Start shopping!</a>
        </div>
      </div>
    </div>
  );
}