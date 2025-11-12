import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletConnect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QTC Store",
  description: "Solana-based ecommerce platform with QTC tokens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletContextProvider>
          <nav className="bg-white shadow-lg p-4 mb-8">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">QTC Store</h1>
              <div className="flex items-center gap-4">
                <a href="/" className="hover:text-blue-600">Home</a>
                <a href="/products" className="hover:text-blue-600">Products</a>
                <a href="/cart" className="hover:text-blue-600">Cart</a>
                <a href="/account" className="hover:text-blue-600">Account</a>
              </div>
            </div>
          </nav>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
