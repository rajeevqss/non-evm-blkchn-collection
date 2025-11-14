import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QTC Web Contract - Smart Contract Management",
  description: "Web interface for managing QTC smart contract on Solana blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-indigo-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                QTC Smart Contract Manager
              </h1>
              <nav className="flex space-x-6">
                <a href="/" className="hover:text-indigo-200 transition-colors">
                  Dashboard
                </a>
                <span className="text-indigo-200">
                  Solana Devnet
                </span>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 QTC Smart Contract Manager. Powered by Solana blockchain.</p>
            <p className="text-sm text-gray-400 mt-2">
              Contract Management • Token Operations • Blockchain Analytics
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}