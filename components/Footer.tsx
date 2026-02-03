import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
    const navigate = useNavigate();

    const scrollToTop = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-gray-950 text-white border-t border-gray-900 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand & Newsletter Strip */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <Logo className="h-9 w-9" />
                            <span className="font-black text-xl tracking-tighter uppercase">Ansar Tools</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-relaxed max-w-xs">
                                Professional-grade power tools & genuine spare parts store.
                            </p>
                            <form className="flex max-w-xs group">
                                <input
                                    type="email"
                                    placeholder="SUBSCRIBE"
                                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-l-xl text-[10px] font-black tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                                <button className="px-4 py-2 bg-orange-600 text-white rounded-r-xl hover:bg-orange-500 transition-colors">
                                    <ArrowRight size={14} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="lg:pl-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-6">Equipment</h4>
                        <ul className="space-y-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <li><button onClick={() => scrollToTop('/')} className="hover:text-white transition-colors">Full Collection</button></li>
                            <li><button onClick={() => scrollToTop('/?filter=new')} className="hover:text-white transition-colors">New Arrivals</button></li>
                            <li><button onClick={() => scrollToTop('/cart')} className="hover:text-white transition-colors">Review Cart</button></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-6">Assistance</h4>
                        <ul className="space-y-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <li><button onClick={() => scrollToTop('/contact')} className="hover:text-white transition-colors">Contact Expert</button></li>
                            <li><button onClick={() => scrollToTop('/policy')} className="hover:text-white transition-colors">Store Policy</button></li>
                            <li><button onClick={() => scrollToTop('/terms')} className="hover:text-white transition-colors">Legal Terms</button></li>
                        </ul>
                    </div>

                    {/* Contact Row (Now Vertical for Compactness) */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-6">Connect</h4>
                        <ul className="space-y-4 text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                            <li className="flex items-start gap-3">
                                <MapPin size={14} className="text-gray-600 shrink-0 mt-0.5" />
                                <span>Boropara, Dingalhat<br />Bansberia, Pin-712502</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={14} className="text-gray-600 shrink-0" />
                                <span>+91 9874305405</span>
                            </li>
                            <li className="pt-2 flex items-center gap-4">
                                <a href="https://www.instagram.com/ansarpowertools?igsh=NDdxazc1cXE5NmNw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Instagram size={16} /></a>
                                <div className="ml-auto">
                                    <Link to="/login?role=admin" className="p-2 border border-blue-900/30 rounded-lg text-blue-500 hover:bg-blue-950/20 transition-all">
                                        <ShieldCheck size={14} />
                                    </Link>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Ultra-Slim Bottom Bar */}
            <div className="border-t border-gray-900/50 bg-black/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Logo className="h-6 w-6 opacity-80" variant="simple" />
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                &copy; {new Date().getFullYear()} Ansar Power Tools. Professional Security Verified.
                            </p>
                        </div>
                        <div className="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2.5" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3" />
                            <span className="text-[10px] font-black text-gray-700 tracking-tighter">RAZORPAY SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
