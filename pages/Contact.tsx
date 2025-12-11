import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export const Contact: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">Get in touch</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">Have a question about a spare part? Need help with an order? Our team is ready to assist you.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                                <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Phone Support</h3>
                                <p className="text-gray-600 dark:text-gray-400">+91 98743 05405</p>
                                <p className="text-sm text-gray-500">Mon-Sat 9am to 6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
                                <p className="text-gray-600 dark:text-gray-400">support@ansartools.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Warehouse</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Boropara, Dingalhat Near Munna Tea Stall<br />
                                    Bansberia, Pin-712502
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    {success ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                            <p className="text-gray-600 dark:text-gray-300">We'll get back to you within 24 hours.</p>
                            <button onClick={() => setSuccess(false)} className="mt-6 text-orange-600 font-medium hover:underline">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                                <input required type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input required type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" placeholder="you@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                                <textarea required rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" placeholder="How can we help?"></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
