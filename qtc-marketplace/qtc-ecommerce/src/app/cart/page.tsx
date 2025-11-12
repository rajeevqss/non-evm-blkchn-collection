'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, usdToQTC } from '@/lib/api';

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('qtc-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter(item => item.quantity > 0);
    
    setCartItems(updatedCart);
    localStorage.setItem('qtc-cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('qtc-cart', JSON.stringify(updatedCart));
  };

  const totalQTC = cartItems.reduce((sum, item) => 
    sum + (usdToQTC(item.price) * item.quantity), 0
  );

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
        <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow mb-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded">
                <Image src={item.image} alt={item.title} fill className="object-contain p-2" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-600">{usdToQTC(item.price)} QTC</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Items ({cartItems.length})</span>
              <span>{totalQTC} QTC</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">{totalQTC} QTC</span>
            </div>
          </div>

          <Link href="/checkout" className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold block text-center">
            Proceed to Checkout
          </Link>
          
          <Link href="/products" className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-semibold block text-center mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}