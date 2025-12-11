import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Copy } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams();

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      alert('Order ID copied!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for your purchase. We have sent a confirmation email to your inbox.
        </p>

        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 mb-8 max-w-sm mx-auto">
          <p className="text-sm text-gray-500 uppercase font-bold tracking-wide mb-2">Your Order Number</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-bold text-gray-900">{orderId}</span>
            <button onClick={copyToClipboard} className="text-gray-400 hover:text-orange-600">
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/tracking" className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-all">
            Track Order
          </Link>
          <Link to="/" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};