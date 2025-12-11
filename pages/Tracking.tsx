
import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { OrderStatus } from '../types';

export const Tracking: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<ReturnType<typeof useOrder>['getOrderByNumber'] | null>(null);
  const [searched, setSearched] = useState(false);
  const { getOrderByNumber } = useOrder();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = getOrderByNumber(searchId);
    setResult(order);
    setSearched(true);
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 0;
      case OrderStatus.PAID: return 1;
      case OrderStatus.PROCESSING: return 2;
      case OrderStatus.SHIPPED: return 3;
      case OrderStatus.DELIVERED: return 4;
      default: return 0;
    }
  };

  const currentStep = result ? getStatusStep(result.status) : 0;
  
  const steps = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Payment Confirmed', icon: CheckCircle },
    { label: 'Processing', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: CheckCircle }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h1>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Enter Order Number (e.g., ANS-2024...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {searched && !result && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          Order not found. Please check your order number.
        </div>
      )}

      {result && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order #{result.orderNumber}</h2>
              <p className="text-gray-500 text-sm mt-1">Placed on {new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                result.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                result.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {result.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {result.status !== OrderStatus.CANCELLED && (
            <div className="relative mb-12">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-1000"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
              <div className="relative z-10 flex justify-between w-full">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                        isCompleted ? 'bg-orange-600 border-orange-200 text-white' : 'bg-white border-gray-200 text-gray-300'
                      } transition-colors duration-500`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.status === OrderStatus.SHIPPED && result.trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center gap-4">
              <Truck className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-800 font-bold">Shipment On The Way</p>
                <p className="text-sm text-blue-600">
                  Courier: {result.courierName} | Tracking ID: <span className="font-mono bg-white px-2 rounded border border-blue-200">{result.trackingNumber}</span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Order Items</h3>
            {result.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2">
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="font-medium text-gray-600">Total Paid</span>
              <span className="font-bold text-xl text-gray-900">₹{result.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
