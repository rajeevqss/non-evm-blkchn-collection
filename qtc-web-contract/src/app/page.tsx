import Link from 'next/link';
import JupiterSwap from '@/components/JupiterSwap';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          QTC Web Contract
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A modern web interface for managing Solana smart contracts. 
          Deploy, interact, and monitor your QTC token contracts with ease.
        </p>
        <Link 
          href="/explorer"
          className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Launch Explorer
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Contract Management</h3>
          <p className="text-gray-600">Deploy and manage your QTC token contracts on Solana with a user-friendly interface.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Token Operations</h3>
          <p className="text-gray-600">Transfer, mint, and manage QTC tokens with real-time balance tracking and transaction history.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Blockchain Explorer</h3>
          <p className="text-gray-600">View contract details, transaction history, and explore Solana blockchain methods.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Real-time Updates</h3>
          <p className="text-gray-600">Live balance updates, transaction confirmations, and network status monitoring.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">🛠️</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Developer Tools</h3>
          <p className="text-gray-600">Access Solana Web3.js methods with interactive tooltips and comprehensive documentation.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">🔄</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Token Swapping</h3>
          <p className="text-gray-600">Swap between SOL, USDC, USDT, BONK, JUP, and QTC tokens using Jupiter's aggregated liquidity.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Project Ideas</h3>
          <p className="text-gray-600">Explore POC projects from DeFi protocols to GameFi applications you can build on Solana.</p>
        </div>
      </div>

      {/* Jupiter Swap Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Token Swapping</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Swap between popular Solana tokens using Jupiter's aggregated liquidity. 
            Get the best rates across all Solana DEXs in one interface.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <JupiterSwap />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-16">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">7+</div>
            <div className="text-gray-600">Supported Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Solana Methods</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
            <div className="text-gray-600">POC Project Ideas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-gray-600">Open Source</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start?</h2>
        <p className="text-gray-600 mb-8">
          Access the full smart contract dashboard to manage your QTC tokens and explore Solana development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/explorer"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
          </Link>
          <a 
            href="https://docs.solana.com/developing/programming-model/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}