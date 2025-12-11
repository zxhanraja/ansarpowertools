import React from 'react';
import { Scale, FileText, AlertCircle, RefreshCw } from 'lucide-react';

export const Terms: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-900 px-8 py-10 text-center">
                    <Scale className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
                    <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="p-8 md:p-12 space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-600" /> 1. Acceptance of Terms
                        </h2>
                        <p>By accessing and placing an order with Ansar Power Tools, you confirm that you are in agreement with and bound by the terms of service outlined below. These terms apply to the entire website and any email or other type of communication between you and Ansar Power Tools.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" /> 2. Products & Pricing
                        </h2>
                        <p>We strive to ensure the accuracy of pricing and product information. However, errors may occur. We reserve the right to:</p>
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li>Correct any errors in pricing or descriptions.</li>
                            <li>Cancel or refuse any order based on incorrect price or description.</li>
                            <li>Change product prices at any time without prior notice.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-orange-600" /> 3. Policy Alignment
                        </h2>
                        <p>By purchasing from our store, you also agree to our <strong className="text-gray-900 dark:text-white">Store Policies</strong> regarding payments and returns. Specifically:</p>
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li>All sales are final.</li>
                            <li>No returns or refunds are accepted except for transit damage with proof.</li>
                            <li>Full advance payment is required for all orders.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Intellectual Property</h2>
                        <p>The website and its original content, features, and functionality are owned by Ansar Power Tools and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Limitation of Liability</h2>
                        <p>In no event shall Ansar Power Tools be liable for any indirect, special, incidental, or consequential damages arising out of the use or inability to use the materials on this site or the performance of the products purchased.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
