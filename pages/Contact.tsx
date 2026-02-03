import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        alert('Message sent! We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
            <div className="text-center mb-16">
                <p className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Get in Touch</p>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-6">Contact Us</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    Have questions about our professional equipment or need expert technical support? We're here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Contact Info */}
                <div className="space-y-12">
                    <div>
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-10">Verification Hub</h2>
                        <div className="space-y-10">
                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shrink-0 shadow-lg">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">Main Branch</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                                        Boropara, Dingalhat Near Munna Tea Stall<br />
                                        Bansberia, Pin-712502
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-orange-500 text-white rounded-2xl shrink-0 shadow-lg shadow-orange-500/20">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">Phone Support</h3>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white mt-2 tracking-tighter">
                                        +91 9874305405
                                    </p>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">Mon-Sat 9am to 6pm IST</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">Support Email</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold underline decoration-orange-500/30">
                                        support@ansartools.com
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Response within 24 hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder or additional info */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                            <Clock className="text-orange-500" size={32} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Service Operating Hours</h4>
                        <p className="text-gray-400 text-xs font-medium max-w-[200px]">Our technical team is available for on-site consultation during business hours.</p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-900 dark:bg-black p-10 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-black/20 text-white border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl"></div>

                    <h2 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare className="text-orange-500" />
                        Direct Inquiry
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500/50 outline-none transition-all font-bold text-sm"
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500/50 outline-none transition-all font-bold text-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Subject</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500/50 outline-none transition-all font-bold text-sm"
                                placeholder="Technical support, Order status, etc."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Message</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500/50 outline-none transition-all resize-none font-bold text-sm"
                                placeholder="Describe your request in detail..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-orange-600/20"
                        >
                            <Send size={16} />
                            Dispatch Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
