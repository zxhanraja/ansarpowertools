import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, User, LogOut, Menu, X, Hammer, BarChart, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { BackButton } from './BackButton';

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
      <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <Logo className="h-10 w-10 text-gray-900 dark:text-white" />
                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">ANSAR TOOLS</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">


              {isAdmin && (
                <Link to="/admin" className={`font-medium transition-colors flex items-center gap-1 ${isActive('/admin')}`}>
                  <BarChart size={18} />
                  Admin
                </Link>
              )}
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-6">


              <Link to="/cart" className="relative group">
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium">
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">


              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-gray-800 active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-transform"
              >
                Logout ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton />
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-10 sm:pt-12 pb-6 sm:pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Logo className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500" />
                <span className="font-bold text-base sm:text-lg">ANSAR TOOLS</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 sm:mb-4">
                Professional grade power tools for contractors and DIY enthusiasts. Built to last.
              </p>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <p className="text-xs text-orange-400 font-bold uppercase mb-1">Dispatch Policy</p>
                <p className="text-xs text-gray-300">First pay, then we will dispatch the order. (No COD)</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" onClick={scrollToProducts} className="hover:text-white transition-colors text-left">All Products</Link></li>
                <li><Link to="/?filter=new" onClick={scrollToProducts} className="hover:text-white transition-colors text-left">New Arrivals</Link></li>
                <li><Link to="/?filter=featured" onClick={scrollToProducts} className="hover:text-white transition-colors text-left">Featured</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">Support & Policy</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/policy" className="hover:text-white transition-colors">Return Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">Internal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/login?role=admin" className="hover:text-white transition-colors flex items-center gap-2"><ShieldCheck size={14} /> Admin Access</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Ansar Power Tools. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};