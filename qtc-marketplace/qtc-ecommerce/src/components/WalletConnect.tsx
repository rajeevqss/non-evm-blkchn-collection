'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, useEffect, useState } from 'react';
import { getQTCBalance } from '@/lib/solana';

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        onError={(error) => {
          console.error('Wallet error:', error);
          // Don't throw for WalletNotSelectedError during initialization
          if (error.name === 'WalletNotSelectedError') {
            console.log('No wallet selected - this is expected during initial load');
            return;
          }
        }}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function WalletInfo() {
  const { publicKey, connected, connect, disconnect, select, wallets } = useWallet();
  const [qtcBalance, setQtcBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      getQTCBalance(publicKey).then(setQtcBalance);
    }
  }, [connected, publicKey]);

  const handleWalletSelect = async (walletName: string) => {
    setIsConnecting(true);
    setShowWalletOptions(false);
    try {
      console.log('🔗 Attempting to connect to wallet:', walletName);
      select(walletName as any);
      await new Promise(resolve => setTimeout(resolve, 500));
      await connect();
      console.log('✅ Wallet connected successfully');
    } catch (error) {
      console.error('Connection failed:', error);
      if (error.name === 'WalletNotSelectedError') {
        console.log('Wallet not selected error - trying to reconnect...');
        // Try again after a short delay
        setTimeout(() => {
          connect().catch(console.error);
        }, 1000);
      } else {
        alert(`Please make sure ${walletName} wallet is installed and unlocked`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
      {!connected ? (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-4 text-sm">Connect to start shopping with QTC tokens!</p>
          
          {!showWalletOptions ? (
            <button
              onClick={() => setShowWalletOptions(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
            >
              Select Wallet
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleWalletSelect('Phantom')}
                disabled={isConnecting}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnecting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '👻'}
                Phantom
              </button>
              <button
                onClick={() => handleWalletSelect('Solflare')}
                disabled={isConnecting}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnecting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '☀️'}
                Solflare
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
          
          <p className="text-xs text-gray-500 mb-2 font-mono">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
          {publicKey && (
            <p className="text-xs mb-3">
              {publicKey.toString() === '9EUKXSp3jCkfb2v6q7spzcxTbzokow2hLTyX2rET9e9K' ? 
                '🟢 User Wallet (Expected: 6k QTC)' :
                publicKey.toString() === '52xR5CuemRBRv3389vEhAeKcg6bTY9Tss7tm7TenXczm' ?
                '🔵 Parent Wallet (Expected: 95k QTC)' :
                '⚪ Unknown Wallet'
              }
            </p>
          )}
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-2xl font-bold text-green-600">{qtcBalance} QTC</p>
            <p className="text-xs text-gray-500">Token Balance</p>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}