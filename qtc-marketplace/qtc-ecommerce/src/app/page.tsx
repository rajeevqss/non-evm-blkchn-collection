import Link from "next/link";
import { WalletInfo } from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          QTC Store
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Shop with QTC tokens on Solana. Connect your wallet to get 1000 free QTC tokens and start shopping!
        </p>
        
        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletInfo />
        </div>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Shop Now
          </Link>
          <Link 
            href="/products" 
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            Browse Products
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🪙</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">QTC Token Payments</h3>
          <p className="text-gray-600">Pay with our native QTC tokens built on Solana</p>
        </div>
        
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎁</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Free Signup Bonus</h3>
          <p className="text-gray-600">Get 1000 QTC tokens when you connect your wallet</p>
        </div>
        
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Fast & Secure</h3>
          <p className="text-gray-600">Lightning-fast transactions on Solana blockchain</p>
        </div>
      </div>
    </div>
  );
}
