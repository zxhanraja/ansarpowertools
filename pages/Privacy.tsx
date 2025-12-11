import React from 'react';
import { Lock, Eye, Server, Shield, Cookie, Mail } from 'lucide-react';

export const Privacy: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-900 px-8 py-10 text-center">
                    <Lock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
                    <p className="text-gray-400 mt-2">Your privacy is important to us.</p>
                </div>

                <div className="p-8 md:p-12 space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-orange-600" /> Information We Collect
                        </h2>
                        <p>We collect information you provide directly to us when you make a purchase, create an account, or interact with our services. This typically includes:</p>
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li>Personal identification (Name, Email address, Phone number).</li>
                            <li>Shipping and billing addresses.</li>
                            <li>Order history and preferences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Server className="h-5 w-5 text-orange-600" /> How We Use Your Data
                        </h2>
                        <p>Your information is used strictly to provide and improve our services to you. We use it to:</p>
                        <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                            <li>Process and fulfill your orders.</li>
                            <li>Communicate regarding order status and updates.</li>
                            <li>Provide customer support.</li>
                            <li>Detect and prevent fraud.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-orange-600" /> Data Security
                        </h2>
                        <p>We implement a variety of security measures to maintain the safety of your personal information. We use secure servers and encryption to protect sensitive data during transmission.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Cookie className="h-5 w-5 text-orange-600" /> Cookies
                        </h2>
                        <p>We use cookies to enhance your browsing experience, remember your preferences (like theme selection), and analyze site traffic. You can choose to disable cookies through your browser settings, though some site features may not function properly.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-orange-600" /> Contact Us
                        </h2>
                        <p>If you have any questions regarding this privacy policy, you may contact us using the information on our Contact page or email us at support@ansartools.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
