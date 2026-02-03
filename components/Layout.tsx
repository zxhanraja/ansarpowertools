import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, User, LogOut, Menu, X, Hammer, BarChart, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { BackButton } from './BackButton';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-orange-500' : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400';

  const scrollToProducts = () => {
    navigate('/');
    // Use a small timeout to allow navigation to complete if on another page
    setTimeout(() => {
      const el = document.getElementById('products');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <Logo className="h-9 w-9 sm:h-10 sm:w-10 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all active:scale-95" />
                <span className="font-black text-lg sm:text-xl text-gray-900 dark:text-white tracking-tighter uppercase">Ansar Tools</span>
              </Link>
            </div>

            {/* Desktop Menu & Search Placeholder */}
            <div className="hidden lg:flex items-center flex-1 justify-center px-12">
              <div className="flex items-center space-x-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <Link to="/" className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Store</Link>
                {isAdmin && (
                  <Link to="/admin" className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === '/admin' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-5">
              <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300 group-hover:text-orange-600 transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-orange-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 animate-in fade-in zoom-in duration-300">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1"></div>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all outline-none"
                  >
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight text-left">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{user.name}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{user.role}</span>
                    </div>
                  </button>

                  {/* Dropdown - Fixed for mobile hover issue by using explicit state */}
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[55]" onClick={() => setIsUserMenuOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-1.5 z-[60] animate-in fade-in zoom-in duration-200 transform origin-top-right">
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <BarChart size={16} /> Admin Panel
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2.5 sm:px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-lg active:scale-95">
                  <User size={18} className="sm:hidden" />
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

      </nav>

      {/* Improved Mobile Menu Overlay - Moved outside nav for better stacking */}
      <div className={`fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[100] transition-opacity duration-500 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div
          className={`absolute right-0 top-0 h-full w-[300px] sm:w-[350px] bg-white dark:bg-gray-950 shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out p-8 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg shadow-sm">
                <Logo className="h-5 w-5" variant="simple" />
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white uppercase">Menu</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-sm ${location.pathname === '/'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800 hover:border-orange-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${location.pathname === '/' ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                <ShoppingCart size={20} className={location.pathname === '/' ? 'text-white' : 'text-orange-600'} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[12px]">Store Home</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-sm ${location.pathname === '/contact'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800 hover:border-orange-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${location.pathname === '/contact' ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                <User size={20} className={location.pathname === '/contact' ? 'text-white' : 'text-orange-600'} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[12px]">Contact Expert</span>
            </Link>

            <Link
              to="/policy"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-sm ${location.pathname === '/policy'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800 hover:border-orange-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${location.pathname === '/policy' ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                <ShieldCheck size={20} className={location.pathname === '/policy' ? 'text-white' : 'text-orange-600'} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[12px]">Store Policy</span>
            </Link>

            <Link
              to="/terms"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-sm ${location.pathname === '/terms'
                ? 'bg-orange-600 text-white border-orange-500'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800 hover:border-orange-200'
                }`}
            >
              <div className={`p-2 rounded-xl ${location.pathname === '/terms' ? 'bg-white/20' : 'bg-orange-50 dark:bg-orange-950/30'}`}>
                <Hammer size={20} className={location.pathname === '/terms' ? 'text-white' : 'text-orange-600'} />
              </div>
              <span className="font-bold uppercase tracking-widest text-[12px]">Legal Terms</span>
            </Link>

            {!user && (
              <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white group"
                >
                  <div className="p-2 rounded-xl bg-orange-500 group-hover:bg-white/20 transition-colors">
                    <User size={20} className="text-white" />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-[12px]">Login / Create Account</span>
                </Link>
              </div>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all border shadow-sm ${location.pathname === '/admin'
                    ? 'bg-orange-600 text-white border-orange-500'
                    : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30 hover:bg-orange-100'
                  }`}
              >
                <div className={`p-2 rounded-xl ${location.pathname === '/admin' ? 'bg-white/20' : 'bg-white dark:bg-gray-800'}`}>
                  <BarChart size={20} className={location.pathname === '/admin' ? 'text-white' : 'text-orange-500'} />
                </div>
                <span className="font-bold uppercase tracking-widest text-[12px]">Admin Panel</span>
              </Link>
            )}
          </div>

          <div className="pt-8 mt-auto border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                  <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">{user.name}</span>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 p-5 rounded-[2rem] bg-red-50 dark:bg-red-950/10 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100/50"
                >
                  <LogOut size={20} /> Logout Account
                </button>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Experience Premium Support
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};