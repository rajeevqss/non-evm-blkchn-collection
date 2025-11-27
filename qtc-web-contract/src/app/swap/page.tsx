import Link from 'next/link';
import OrcaSwap from '@/components/OrcaSwap';
import JupiterSwap from '@/components/JupiterSwap';
import RaydiumSwap from '@/components/RaydiumSwap';
import DevnetGuide from '@/components/DevnetGuide';

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Token Swapping Hub
        </h1>
        <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
          Launch your QTC token with Raydium DEX integration. 
          Create OpenBook markets, AMM pools, and enable Jupiter aggregation.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Network Guide */}
      <div className="max-w-4xl mx-auto mb-12">
        <DevnetGuide />
      </div>

      {/* Raydium Section - Featured at Top */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Raydium DEX - Recommended
          </h2>
          <p className="text-gray-600 mb-4">
            Professional DEX with OpenBook integration - supports custom token launches
          </p>
          <div className="flex justify-center space-x-4 text-xs mb-4">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Works Now</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Custom Pools</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Jupiter Ready</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl shadow-lg border-2 border-green-200">
          <RaydiumSwap />
        </div>
      </div>

      {/* Secondary Options */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-12">
        
        {/* Jupiter Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Jupiter Aggregator
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Routes through your Raydium pools once created
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Real Quotes</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Mainnet</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">After Pools</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
            <JupiterSwap />
          </div>
          
          {/* Jupiter Features */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Jupiter Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Aggregates liquidity from 20+ DEXs</li>
              <li>• Automatically finds your Raydium pools</li>
              <li>• Smart routing for optimal trades</li>
              <li>• Real-time quotes and pricing</li>
              <li>• Works once QTC pools exist</li>
            </ul>
          </div>
        </div>

        {/* Orca Reference Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Orca AMM
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Reference implementation - requires team approval
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Restricted</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Contact Required</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Reference Only</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-300">
            <OrcaSwap />
          </div>
          
          {/* Orca Limitations */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Orca Limitations:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Requires Orca team approval</li>
              <li>• No public pool creation API</li>
              <li>• Custom tokens need whitelisting</li>
              <li>• Use for reference/learning only</li>
              <li>• <strong>Raydium recommended for launches</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Raydium OpenBook Explanation */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Understanding Raydium Architecture
          </h2>
          <div className="space-y-4 text-blue-800">
            <div>
              <h3 className="font-semibold mb-2">Why OpenBook Market is Required:</h3>
              <p className="text-sm">
                Unlike pure AMM protocols, Raydium uses a hybrid model that combines OpenBook (order book) with AMM pools for better capital efficiency and price discovery.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: OpenBook Market</h4>
                <ul className="text-xs space-y-1">
                  <li>• Creates QTC/SOL trading pair</li>
                  <li>• Enables limit orders</li>
                  <li>• Provides price discovery</li>
                  <li>• Professional trading features</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Step 2: AMM Pool</h4>
                <ul className="text-xs space-y-1">
                  <li>• Links to OpenBook market</li>
                  <li>• Provides instant liquidity</li>
                  <li>• Enables retail swaps</li>
                  <li>• Jupiter auto-discovery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Token Launch Strategy Comparison
        </h2>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orca</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jupiter</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Raydium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Recommended For</td>
                <td className="px-6 py-4 text-sm text-center text-yellow-600">Reference Only</td>
                <td className="px-6 py-4 text-sm text-center text-blue-600">After Launch</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">QTC Launch</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Custom Pool Creation</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">Team Approval</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">Routes Only</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Full Support</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Setup Requirements</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">Whitelisting</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">None</td>
                <td className="px-6 py-4 text-sm text-center text-yellow-600">OpenBook + AMM</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Professional Features</td>
                <td className="px-6 py-4 text-sm text-center text-yellow-600">If Available</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Best Routing</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Limit Orders</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Jupiter Integration</td>
                <td className="px-6 py-4 text-sm text-center text-yellow-600">If Pools Exist</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Native</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Automatic</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Current Status</td>
                <td className="px-6 py-4 text-sm text-center text-red-600">Blocked</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Working</td>
                <td className="px-6 py-4 text-sm text-center text-green-600">Ready to Use</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-gray-600 mb-6">
          Choose the approach that best fits your needs and start experimenting with token swaps.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/explorer"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Token Contracts
          </Link>
          <a 
            href="https://docs.raydium.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Raydium Documentation
          </a>
        </div>
      </div>
    </div>
  );
}