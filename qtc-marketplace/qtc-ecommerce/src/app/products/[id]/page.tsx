'use client';

import { fetchProduct, usdToQTC, Product } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      fetchProduct(parseInt(id)).then(data => {
        if (!data) {
          notFound();
        } else {
          setProduct(data);
        }
        setLoading(false);
      });
    });
  }, [params]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Link href="/products" className="text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative h-96 bg-gray-100 rounded-lg">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-8"
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-blue-600">{usdToQTC(product.price)} QTC</span>
            <span className="text-gray-500">${product.price}</span>
            <div className="flex items-center">
              <span className="text-yellow-500">⭐ {product.rating.rate}</span>
              <span className="text-gray-500 text-sm ml-1">({product.rating.count} reviews)</span>
            </div>
          </div>

          <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Info</h3>
            <p className="text-sm text-gray-600">
              Pay with QTC tokens from your Solana wallet. Connect your wallet to see your balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}