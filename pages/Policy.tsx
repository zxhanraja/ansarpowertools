
import React from 'react';
import { ShieldAlert, CreditCard, Truck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Policy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 px-8 py-10 text-center">
          <ShieldAlert className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Store Policies</h1>
          <p className="text-gray-400 mt-2">Please read carefully before placing an order.</p>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          
          {/* Section 1: Payment Policy */}
          <section className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Payment & Dispatch Policy</h2>
              <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 p-4 mb-4">
                <p className="font-bold text-orange-800 dark:text-orange-200">
                  ⚠️ Advance Payment Required
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  We do not offer Cash on Delivery (COD).
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                At Ansar Power Tools, we operate on a strictly <strong>pre-paid model</strong>. 
                Your order will only be processed and dispatched for shipping once the full payment has been successfully verified.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li>Orders remain in "Pending" status until payment is confirmed.</li>
                <li>Dispatch occurs within 24-48 hours of payment confirmation.</li>
                <li>Tracking details are emailed immediately after dispatch.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Section 2: No Return / No Refund */}
          <section className="flex flex-col md:flex-row gap-6">
             <div className="shrink-0">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Return & No Refund Policy</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Due to the nature of industrial spare parts and power tools, <strong>all sales are final</strong>. 
                We do not accept returns or provide refunds once an order has been delivered.
              </p>
              
              <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-2">Why this policy?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Spare parts (armatures, coils, switches) are sensitive components. Once handled or attempted to be installed, 
                their integrity cannot be guaranteed for resale. This ensures every customer receives 100% brand new, unused parts.
              </p>

              <h3 className="font-bold text-gray-900 dark:text-white mt-6 mb-2">Exceptions (Damaged on Arrival)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                If you receive a package that is physically damaged during transit, please record a video while opening the parcel 
                and contact us within 24 hours. We may consider replacements solely for transit damage cases with video proof.
              </p>
            </div>
          </section>

          <div className="flex justify-center pt-8">
            <Link 
              to="/" 
              className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              I Understand, Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
