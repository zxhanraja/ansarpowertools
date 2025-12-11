import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserRole } from '../types';
import { User, Shield, LogIn, AlertCircle, Lock, ArrowLeft, CheckCircle, Mail, ArrowRight, Store } from 'lucide-react';
import { Loader } from '../components/Loader';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { login, signup, logout } = useAuth();
  const navigate = useNavigate();
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

    try {
      const role = isAdminRoute ? UserRole.ADMIN : UserRole.CUSTOMER;

      if (isLoginMode) {
        const { error } = await login(email, password);
        if (error) throw error;
        
        // Strict Admin Check
        if (isAdminRoute) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentUser.id)
              .maybeSingle();

            if (profile?.role !== UserRole.ADMIN) {
              await logout();
              throw new Error("Unauthorized: This area is for Admins only.");
            }
          }
        }
      } else {
        const { error } = await signup(email, password, name, role);
        if (error) throw error;
        setSuccess('Account created successfully! Redirecting...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (isAdminRoute) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error("Auth Error:", errorMsg);
      
      let displayMsg = errorMsg || 'An error occurred during authentication';
      
      if (displayMsg.includes('Database error saving new user')) {
        displayMsg = 'System Setup: Database tables are missing. Run SQL script.';
      } else if (displayMsg.includes('Invalid login credentials')) {
        displayMsg = 'Invalid email or password. Please try again.';
      } else if (displayMsg.includes('email not confirmed')) {
        displayMsg = 'Please verify your email address.';
      }
      
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
  };

  // --- VIEW 1: ADMIN PORTAL (Secure/Dark Theme) ---
  if (isAdminRoute) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl border-t-4 border-orange-600 dark:border-orange-500">
          <div>
            <div className="mx-auto h-16 w-16 bg-gray-900 dark:bg-gray-950 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Restricted Access. Authorized Personnel Only.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 p-4 rounded-r">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200 font-bold">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm font-mono transition-colors"
                    placeholder="admin@ansartools.com"
                    value={email}
                    onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secure Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handleInputChange(setPassword, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gray-900 dark:bg-orange-600 hover:bg-gray-800 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 transition-all shadow-md"
            >
              {loading ? (
                <Loader size={20} className="inline-block" />
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-500 dark:text-white/50 group-hover:text-white transition-colors" />
                  </span>
                  Authenticate
                </>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <ArrowLeft size={14} /> Return to Store
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CUSTOMER STORE LOGIN (Split Screen Professional) ---
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-gray-800 my-4 md:my-8 border border-gray-100 dark:border-gray-700">
      
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isLoginMode 
                ? 'Enter your credentials to access your account.' 
                : 'Join the community of professional builders.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-3 border border-red-100 dark:border-red-900/50">
               <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
               <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-900/50">
              <CheckCircle className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required={!isLoginMode}
                    value={name}
                    onChange={(e) => handleInputChange(setName, e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleInputChange(setEmail, e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange(setPassword, e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              {!isLoginMode && <p className="text-xs text-gray-500 dark:text-gray-400">Must be at least 6 characters</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-lg font-bold text-base transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader size={24} className="inline-block" />
              ) : isLoginMode ? (
                <>Sign In <ArrowRight className="h-5 w-5" /></>
              ) : (
                <>Create Account</>
              )}
            </button>
          </form>

          {/* Toggle View Section */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            {isLoginMode ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                New to Ansar Tools?{' '}
                <button 
                  type="button"
                  onClick={() => { setIsLoginMode(false); setError(''); }}
                  className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-colors"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { setIsLoginMode(true); setError(''); }}
                  className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            )}
            
            {/* Professional Helper Text */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 py-3 px-4 rounded-lg inline-block">
               <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                 {isLoginMode 
                   ? "If you haven't created an account yet, please switch to the Sign Up tab." 
                   : "Create an account to track orders and checkout faster."}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding/Visual */}
      <div className="hidden md:block w-1/2 relative bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1600" 
          alt="Workshop Tools" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 to-gray-900/90 flex flex-col justify-between p-16 text-white">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Store className="h-8 w-8 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">ANSAR TOOLS</span>
            </div>
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Professional Equipment.<br/>Reliable Results.
            </h2>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Join thousands of professionals who trust Ansar Tools for their spare parts and machinery needs.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Real-time Tracking</h3>
                <p className="text-sm text-white/70">Monitor your shipments every step of the way.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                 <h3 className="font-bold">Secure Payments</h3>
                 <p className="text-sm text-white/70">Encrypted transactions via Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};