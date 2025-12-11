
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any power tools yet.</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-md">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-gray-900">Shopping Cart ({items.length} items)</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  <p className="text-orange-600 font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>₹{(cartTotal * 0.18).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>₹{(cartTotal * 1.18).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
          <Link 
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Proceed to Checkout
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Secure checkout powered by Stripe.</p>
            <p>No COD. All major credit cards accepted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
