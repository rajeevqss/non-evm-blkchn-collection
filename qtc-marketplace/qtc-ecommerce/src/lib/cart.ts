import { Product } from './api';

export interface CartItem extends Product {
  quantity: number;
}

export function addToCart(product: Product, quantity: number = 1) {
  if (typeof window === 'undefined') return;
  
  const savedCart = localStorage.getItem('qtc-cart');
  const currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
  
  const existingItem = currentCart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    currentCart.push({ ...product, quantity });
  }
  
  localStorage.setItem('qtc-cart', JSON.stringify(currentCart));
  
  // Show success message
  alert(`Added ${product.title} to cart!`);
}

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  const savedCart = localStorage.getItem('qtc-cart');
  return savedCart ? JSON.parse(savedCart) : [];
}

export function getCartItemCount(): number {
  return getCartItems().reduce((count, item) => count + item.quantity, 0);
}