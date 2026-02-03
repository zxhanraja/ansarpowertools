import React from 'react';
import { Lock, Eye, Server, Shield, Cookie, Mail } from 'lucide-react';

export const Privacy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
            <div className="text-center mb-16">
                <p className="text-orange-600 font-bold uppercase tracking-wide text-sm mb-2">Legal</p>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Privacy Policy</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We are committed to protecting your personal data and ensuring transparency in how we handle it.
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <Eye className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Information Collection</h2>
                        <p className="leading-relaxed">
                            We collect information necessary to provide our services, including your name, contact details (email, phone number), billing and shipping addresses, and payment information. We may also collect technical data about your device and browsing activity to improve our website.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <Server className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Data Usage</h2>
                        <p className="leading-relaxed">
                            Your data is used primarily to process orders, manage your account, and provide customer support. We may also use it to send you important updates or promotional offers (which you can opt-out of). We do not sell your personal data to third parties.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Security Measures</h2>
                        <p className="leading-relaxed">
                            We implement robust security measures, including encryption (SSL) and secure access protocols, to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-start mb-12">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-orange-600 shrink-0">
                        <Cookie className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-0">Cookies & Tracking</h2>
                        <p className="leading-relaxed">
                            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You have the control to manage or disable cookies through your browser settings.
                        </p>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500">
                        Last updated: December 2025
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        For any privacy-related concerns, please contact our Data Protection Officer at <a href="mailto:privacy@ansartools.com" className="text-orange-600 hover:underline">privacy@ansartools.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
