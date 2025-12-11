
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus, ShippingDetails } from '../types';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Loader } from '../components/Loader';

export const Checkout: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { createOrder } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Shipping, 2: Payment

  const totalAmount = cartTotal * 1.18; // 18% GST

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep(2);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProgress(0);

    // Simulate robust server-side processing with load balancing steps
    setProcessingStep("Connecting to secure server...");
    setProgress(10);
    await new Promise(resolve => setTimeout(resolve, 800));

    setProcessingStep("Verifying payment gateway availability...");
    setProgress(35);
    await new Promise(resolve => setTimeout(resolve, 1200));

    setProcessingStep("High traffic detected. Optimizing route...");
    setProgress(55);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setProcessingStep("Processing transaction...");
    setProgress(85);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessingStep("Finalizing order...");
    setProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create Order
    const orderId = crypto.randomUUID();
    const orderNumber = `ANS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
    
    // Updated to await the async Supabase call
    const { error } = await createOrder({
      id: orderId,
      orderNumber,
      userId: user?.id,
      customerEmail: shipping.email,
      items: [...items],
      totalAmount,
      currency: 'INR',
      status: OrderStatus.PAID,
      shippingDetails: shipping,
      createdAt: new Date().toISOString()
    });

    setIsProcessing(false);

    if (error) {
      alert("Failed to place order. Please check connection and try again.");
      console.error(error);
      return;
    }

    clearCart();
    navigate(`/success/${orderNumber}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center">
        <Loader text={processingStep} progress={progress} size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-center">
        <div className={`flex items-center gap-2 ${paymentStep === 1 ? 'text-orange-600 font-bold' : 'text-green-600'}`}>
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">1</div>
          <span>Shipping</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
        <div className={`flex items-center gap-2 ${paymentStep === 2 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">2</div>
          <span>Payment</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {paymentStep === 1 ? (
          <form onSubmit={handleShippingSubmit} className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={shipping.fullName}
                  onChange={e => setShipping({...shipping, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={shipping.email}
                  onChange={e => setShipping({...shipping, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-gray-700">Street Address</label>
                <input 
                  required
                  type="text" 
                  value={shipping.address}
                  onChange={e => setShipping({...shipping, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input 
                  required
                  type="text" 
                  value={shipping.city}
                  onChange={e => setShipping({...shipping, city: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pincode</label>
                <input 
                  required
                  type="text" 
                  value={shipping.zipCode}
                  onChange={e => setShipping({...shipping, zipCode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePayment} className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-orange-600" />
              Payment Method
            </h2>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-gray-900">Order Total</h3>
                <span className="text-xl font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              
              {/* Stripe Simulation Elements */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Card Number</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      placeholder="4242 4242 4242 4242"
                      pattern="\d{4} \d{4} \d{4} \d{4}"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono bg-white text-gray-900"
                    />
                    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Expiration</label>
                    <input 
                      required
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono bg-white text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">CVC</label>
                    <input 
                      required
                      type="text" 
                      placeholder="123"
                      maxLength={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button 
                type="button"
                onClick={() => setPaymentStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                disabled={isProcessing}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="flex-2 w-full bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/30"
              >
                <CheckCircle className="h-5 w-5" />
                Pay ₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">
              <Lock className="h-3 w-3 inline mr-1" />
              Payments are secure and encrypted. This is a simulation using Stripe test logic.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
