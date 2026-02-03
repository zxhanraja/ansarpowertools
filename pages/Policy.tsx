import React from 'react';
import { RotateCcw, PackageCheck, Truck, Ban } from 'lucide-react';

export const Policy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-orange-600 font-bold uppercase tracking-wide text-sm mb-2">Support</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Return Policy</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Clear and transparent guidelines for returns and refunds.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
        <div className="flex gap-4 items-start mb-12">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Standard Return Window</h2>
            <p className="leading-relaxed">
              We accept returns within 7 days of delivery for damaged or defective items. To be eligible for a return, your item must be unused, in the same condition that you received it, and in the original packaging.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start mb-12">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Required Documentation</h2>
            <ul className="leading-relaxed mt-2 list-none space-y-2 pl-0">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Unboxing video is mandatory for damage claims.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Original invoice/receipt.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Clear photos of the defect.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 items-start mb-12">
          <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600 shrink-0">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Non-Returnable Items</h2>
            <p className="leading-relaxed">
              Certain types of items cannot be returned, including:
            </p>
            <ul className="leading-relaxed mt-2 list-none space-y-2 pl-0">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Used power tools or machinery.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Consumables (blades, sandpaper, drill bits) if opened.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Items without original tags or packaging.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 items-start mb-12">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Refund Process</h2>
            <p className="leading-relaxed">
              Once your return is received and inspected, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Have questions? Contact us at <a href="mailto:support@ansartools.com" className="text-orange-600 hover:underline">support@ansartools.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
