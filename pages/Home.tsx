
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
import { Search, Filter, Plus, Loader2, AlertTriangle, Database, RefreshCw, Terminal, Flashlight, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Loader } from '../components/Loader';
import { Testimonials } from '../components/Testimonials';
import { Product } from '../types';
import { useSearchParams } from 'react-router-dom';

export const Home: React.FC = () => {
  const { products, categories, loading, error, refreshProducts } = useProduct();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (filterParam === 'new') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (filterParam === 'featured') {
      return b.rating - a.rating;
    }
    return 0;
  }).sort((a, b) => {
    if (filterParam === 'new') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (filterParam === 'featured') {
      return b.rating - a.rating;
    }
    return 0;
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, filterParam]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const handleRetry = async () => {
    setRetrying(true);
    await refreshProducts();
    setRetrying(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader text="Loading Products..." />
      </div>
    );
  }

  // Error State - Likely due to missing tables
  if (error) {
    const isTableMissing = error.includes('relation') && error.includes('does not exist');

    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-2xl w-full p-8 rounded-2xl shadow-xl border-t-4 border-red-500 text-center">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Products</h2>
          <p className="text-gray-500 mb-6 font-mono bg-gray-50 p-2 rounded border border-gray-200 text-xs md:text-sm inline-block max-w-full overflow-hidden text-ellipsis">
            Error: {error}
          </p>

          {isTableMissing ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-start gap-3 mb-4">
                <Database className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900">Database Setup Required</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    It looks like the <strong>products table</strong> is missing in Supabase. This is common for new projects.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 text-gray-200 font-mono text-xs md:text-sm overflow-x-auto relative group">
                <div className="absolute top-2 right-2 text-xs text-gray-500 flex items-center gap-1">
                  <Terminal size={12} /> SQL
                </div>
                <p className="mb-2 text-gray-400">-- Run this in Supabase SQL Editor</p>
                <code className="text-green-400">
                  create table public.products (<br />
                  &nbsp;&nbsp;id uuid default gen_random_uuid() primary key,<br />
                  &nbsp;&nbsp;name text not null,<br />
                  &nbsp;&nbsp;price numeric not null,<br />
                  &nbsp;&nbsp;stock integer default 0,<br />
                  &nbsp;&nbsp;...<br />
                  );
                </code>
              </div>
              <p className="text-xs text-blue-600 mt-3 text-center">
                (Please copy and run the full setup script provided in the documentation)
              </p>
            </div>
          ) : (
            <div className="mb-8 max-w-md mx-auto">
              <p className="text-gray-600">
                Please check your internet connection and ensure your Supabase API keys are correct.
              </p>
            </div>
          )}

          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {retrying ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Premium Hero Section */}
      <div className="relative bg-gray-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl min-h-[450px] sm:min-h-[500px] md:min-h-[550px] flex items-center group">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gray-900 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=60&w=1000"
            alt="Industrial Background"
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/50 z-20"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-30 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 md:px-12 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left: Text Content */}
          <div className="w-full md:w-1/2 pt-6 sm:pt-8 md:pt-0 text-center md:text-left z-20">
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-4 sm:mb-6 md:mb-8 backdrop-blur-sm tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="hidden xs:inline">#1 Industrial Supplier in India</span>
              <span className="xs:hidden">#1 Supplier</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-[1.1]">
              Master Your Craft with <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 filter drop-shadow-lg">Precision Tools</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 md:mb-10 max-w-lg leading-relaxed mx-auto md:mx-0 font-medium tracking-wide px-2 sm:px-0">
              Equip yourself with professional-grade power tools and authentic spare parts. Engineered for durability, performance, and those who demand the best.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start px-2 sm:px-0">
              <button
                onClick={() => {
                  const el = document.getElementById('products');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-xl sm:rounded-2xl transition-all shadow-xl hover:shadow-orange-500/25 hover:-translate-y-1 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                Start Shopping <Database className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Right: Featured Product Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
            <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-square">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/20 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none"></div>

              <img
                src="/images/hero_drill.png"
                alt="Professional Power Drill"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 will-change-transform"
                loading="eager"
              />


            </div>
          </div>
        </div>
      </div>

      <div id="products" className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters & Search */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6 lg:sticky lg:top-24 z-30">
          {/* Search */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search className="h-4 w-4" /> Search
            </h3>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all shadow-inner"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors" />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Categories
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`flex-shrink-0 lg:flex-shrink-1 w-auto lg:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 group ${selectedCategory === 'All'
                  ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                  }`}
              >
                <span>All Products</span>
                {selectedCategory === 'All' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 lg:flex-shrink-1 w-auto lg:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 group ${selectedCategory === category.name
                    ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                >
                  <span>{category.name}</span>
                  {selectedCategory === category.name && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-orange-100 dark:hover:border-orange-900/30 transition-all duration-300 group flex flex-col h-full">
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  {product.stock < 10 && (
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-red-100 dark:border-red-900/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      Only {product.stock} left
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow relative">
                  <div className="mb-3">
                    <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1 block">
                      {product.category || 'Spare Part'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.rating})</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addedId === product.id}
                      className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all transform active:scale-95 text-sm ${addedId === product.id
                        ? 'bg-green-600 text-white shadow-green-500/30 shadow-lg'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl hover:shadow-2xl hover:bg-orange-600 dark:hover:bg-gray-200'
                        }`}
                    >
                      {addedId === product.id ? (
                        'Added'
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 mb-6 shadow-sm">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching products</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="text-orange-600 font-bold hover:text-orange-700 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > itemsPerPage && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us - Features Grid (Moved to Bottom) */}
      <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
            <Database className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">100% Genuine Parts</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We source directly from authorized manufacturers to ensure you get authentic armatures, gears, and switches.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6">
            <Flashlight className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Dispatch</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Orders processed within 24 hours. Pre-paid priority shipping ensures your tools reach you when you need them.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
            <Shield className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure Payments</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your transactions are encrypted and secured. We prioritize your safety with verified payment gateways.
          </p>
        </div>
      </div>

      <Testimonials />
    </div>
  );
};
