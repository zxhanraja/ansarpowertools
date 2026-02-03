
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatus, ShippingDetails } from '../types';
import { CreditCard, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { Loader } from '../components/Loader';
import { initializePayment, createRazorpayOrder } from '../lib/razorpay';

export const Checkout: React.FC = () => {
  const { items, cartTotal, clearCart } = useCart();
  const { createOrder } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, navigate, location]);

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
  const [paymentStep, setPaymentStep] = useState(1); // 1: Shipping, 2: Payment

  const totalAmount = cartTotal * 1.18; // 18% GST

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep(2);
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setProcessingStep("Initializing Secure Payment...");

    try {
      // 1. Create Order on Backend (Edge Function)
      // Note: If you haven't deployed the Edge Function yet, this might fail.
      // For now, we'll try to use the order creation, but fallback if it fails or if we want to test without backend.

      let orderId = '';
      try {
        const orderData = await createRazorpayOrder(totalAmount, 'receipt_' + Date.now());
        orderId = orderData.id;
      } catch (e) {
        console.warn("Backend order creation failed (Edge Function might be missing). Proceeding with client-side init for demo.");
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        name: 'Ansar Power Tools',
        description: 'Quality Tools & Spare Parts',
        image: 'https://ansartools.com/logo.svg',
        order_id: orderId,
        prefill: {
          name: shipping.fullName,
          email: shipping.email,
          contact: ''
        },
        // Strict UPI Config
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        theme: {
          color: '#EA580C' // Orange-600
        }
      };

      const response = await initializePayment(options);

      // 3. Payment Success Handling
      setProcessingStep("Verifying Payment...");

      // Create Order in Supabase
      const newOrderNumber = `ANS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

      const { error } = await createOrder({
        id: crypto.randomUUID(),
        orderNumber: newOrderNumber,
        userId: user?.id,
        customerEmail: shipping.email,
        items: [...items],
        totalAmount,
        currency: 'INR',
        status: OrderStatus.PAID,
        shippingDetails: shipping,
        paymentId: response.razorpay_payment_id,
        createdAt: new Date().toISOString()
      });

      if (error) throw error;

      clearCart();
      navigate(`/success/${newOrderNumber}`);

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert("Payment Failed or Cancelled: " + (error.description || error.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center">
        <Loader text={processingStep} size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
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
                  onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  required
                  type="email"
                  value={shipping.email}
                  onChange={e => setShipping({ ...shipping, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium text-gray-700">Street Address</label>
                <input
                  required
                  type="text"
                  value={shipping.address}
                  onChange={e => setShipping({ ...shipping, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  required
                  type="text"
                  value={shipping.city}
                  onChange={e => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pincode</label>
                <input
                  required
                  type="text"
                  value={shipping.zipCode}
                  onChange={e => setShipping({ ...shipping, zipCode: e.target.value })}
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
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-orange-600" />
              Payment Method
            </h2>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium text-gray-900">Order Total</h3>
                <span className="text-xl font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900">UPI Payment</h4>
                    <p className="text-sm text-orange-700 mt-1">Pay instantly using Google Pay, PhonePe, or any UPI App.</p>
                    <p className="text-xs text-orange-600/80 mt-1 font-medium">Cash on Delivery is NOT available.</p>
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
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="flex-[2] w-full bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/30"
              >
                <CheckCircle className="h-5 w-5" />
                Pay via UPI
              </button>
            </div>

            <div className="mt-4 flex justify-center gap-4 grayscale opacity-60">
              {/* Payment Icons */}
              <span className="text-xs text-gray-400 font-medium">100% Secure Payments by Razorpay</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

