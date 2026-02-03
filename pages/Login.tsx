import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { User, Shield, LogIn, AlertCircle, Lock, ArrowLeft, CheckCircle, Mail, ArrowRight, Store, Loader2 as ImageIcon } from 'lucide-react';
import { Loader } from '../components/Loader';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { login, signup, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Determine view based strictly on URL
  const isAdminRoute = searchParams.get('role') === 'admin';

  // Set default values based on route
  useEffect(() => {
    if (isAdminRoute) {
      setEmail('');
      setIsLoginMode(true);
    } else {
      setEmail('');
    }
    setError('');
    setSuccess('');
    setPassword('');
  }, [isAdminRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Safety Timeout: Force stop loading after 5 minutes
    const safetyTimer = setTimeout(() => {
      setLoading(last => {
        if (last) {
          setError("Request timed out. Please refresh and try again.");
          return false;
        }
        return false;
      });
    }, 300000);

    try {
      const role = isAdminRoute ? UserRole.ADMIN : UserRole.CUSTOMER;

      if (isLoginMode) {
        // Race login with a 5 minute timeout
        const result = await login(email, password);
        const { error } = result;

        if (error) throw error;
      } else {
        const { error } = await signup(email, password, name, role);
        if (error) throw error;
        setSuccess('Account created! If registration was successful, you will be logged in automatically. Please check your email if confirmation is required.');
      }

      if (isAdminRoute) {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error("Auth Error:", errorMsg);

      let displayMsg = errorMsg || 'An error occurred during authentication';

      if (displayMsg.includes('Database error saving new user')) {
        displayMsg = 'System Setup: Database connection failure. Please reload.';
      } else if (displayMsg.includes('Invalid login credentials')) {
        displayMsg = 'Invalid email or password.';
      } else if (displayMsg.includes('email not confirmed')) {
        displayMsg = 'Please verify your email address.';
      }

      setError(displayMsg);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
  };

  // --- VIEW 1: ADMIN PORTAL ---
  if (isAdminRoute) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h2>
            <p className="text-sm text-gray-500 mt-2">Authorized personnel only</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex gap-2 items-center">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 border border-transparent text-white py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <ImageIcon className="animate-spin h-5 w-5 text-orange-500" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} /> Authenticate
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4">
              If you don't have an account, please sign up as a regular user first.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <User size={16} /> Regular Customer Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Store size={16} /> Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CUSTOMER LOGIN (Minimal) ---
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            {/* Logo Component should be here, using inline SVG for now to match style */}
            <svg viewBox="30 20 40 60" className="h-12 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M48 25L35 50H48L45 75L65 45H52L55 25H48Z" className="fill-orange-600" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLoginMode ? 'Enter your details to sign in.' : 'Start your journey with us today.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex gap-2 items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg flex gap-2 items-center">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleInputChange(setName, e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <Loader size={20} className="text-white" />
              ) : (
                <>{isLoginMode ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                {isLoginMode ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


