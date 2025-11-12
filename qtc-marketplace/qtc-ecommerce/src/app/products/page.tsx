'use client';

import { fetchProducts, usdToQTC, Product } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-gray-600">{products.length} products available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-4"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-2xl font-bold text-blue-600">{usdToQTC(product.price)} QTC</span>
                  <span className="text-gray-500 text-sm ml-2">${product.price}</span>
                </div>
                <div className="text-yellow-500">
                  ⭐ {product.rating.rate} ({product.rating.count})
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/products/${product.id}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center text-sm font-semibold"
                >
                  View Details
                </Link>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}