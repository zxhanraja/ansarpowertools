import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, CheckCircle2 } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 sm:py-32 px-6">
        <div className="relative inline-block mb-12">
          <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-white dark:bg-gray-900 h-32 w-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-gray-100 dark:border-gray-800 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShoppingBag className="h-14 w-14 text-orange-500" />
          </div>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight">Your Bag is Empty</h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-md mx-auto font-medium">Elevate your workshop with professional-grade power tools from Ansar.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-[0.25em] rounded-2xl hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-xl shadow-black/10 active:scale-95 group"
        >
          Explore Catalog
          <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  const tax = cartTotal * 0.18;
  const grandTotal = cartTotal + tax;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Cart Items List */}
        <div className="flex-grow w-full space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Shopping Bag</h1>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Review your professional equipment</p>
            </div>
            <button
              onClick={clearCart}
              className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-all border border-red-100/50"
            >
              Flush All
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="group relative flex flex-col sm:flex-row items-center gap-8 bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/40 hover:shadow-2xl transition-all duration-500">
                {/* Product Image */}
                <div className="relative h-32 w-32 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] p-4 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform scale-110 group-hover:scale-125 transition-transform duration-500"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{item.category}</span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{item.name}</h3>
                  <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Part ID: {item.sku || 'N/A'}</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Ready to Ship</span>
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 w-full sm:w-auto">
                  <div className="flex items-center p-1.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all active:scale-90"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all active:scale-90"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">₹{item.price.toLocaleString('en-IN')} / unit</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-6 right-6 sm:static p-3 text-red-500 bg-red-50 dark:bg-red-950/20 lg:hover:bg-red-500 lg:hover:text-white active:bg-red-600 active:text-white rounded-2xl transition-all group/trash shadow-sm"
                  >
                    <Trash2 size={20} className="transform group-hover/trash:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-[400px] flex-shrink-0 lg:sticky lg:top-28">
          <div className="bg-gray-900 dark:bg-black rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/20 text-white relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl text-white"></div>

            <h2 className="text-xl font-black uppercase tracking-widest mb-10 border-b border-white/10 pb-6 text-white text-white">Order Summary</h2>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest font-bold">
                <span>Equipment Subtotal</span>
                <span className="text-lg text-white font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest font-bold">
                <span>Logistics & Handling</span>
                <span className="text-green-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest font-bold">
                <span>Tax (GST 18%)</span>
                <span className="text-lg text-white font-bold">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="h-px bg-white/10 my-8"></div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="text-4xl font-black tracking-tighter text-white">₹{grandTotal.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-4 bg-orange-600 hover:bg-orange-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all transform active:scale-95 shadow-xl shadow-orange-600/20 group"
            >
              Secure Checkout
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <Shield size={20} className="text-green-500" />
                <div className="text-[10px] font-black uppercase tracking-widest">
                  <p className="text-white">Professional Guarantee</p>
                  <p className="mt-0.5">Secure Industrial Procurement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm font-bold">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">Price match guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
