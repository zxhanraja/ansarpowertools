
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
    <div className="space-y-6 sm:space-y-12 lg:space-y-20 pb-20 animate-fade-in">
      <div id="products" className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Adaptive Control Bar: Integrated Pod for Mobile, Sidebar for Desktop */}
        <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28 z-30 transition-all order-last lg:order-first">
          <div className="flex flex-col gap-5 lg:gap-8 transition-all">

            {/* Search Box Pod */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-100 dark:border-gray-800/50 transition-all">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-4 ml-1">
                <Search size={12} className="text-orange-500" /> Search Catalog
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Find your tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-sm bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white transition-all font-bold placeholder:text-gray-400"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-orange-500 transition-colors" />
              </div>
            </div>

            {/* Consolidated Product Tools Pod */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-100 dark:border-gray-800/50 transition-all">
              <div className="space-y-6">
                {/* Catalog Filters */}
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-3 ml-1">
                    <Filter size={10} className="text-orange-500" /> Equipment Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-800'
                        }`}
                    >
                      All Tools
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === category.name
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-800'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical Specialists */}
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-3 ml-1">
                    <Flashlight size={10} className="text-orange-500" /> Machine Specialist Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Armature', 'Gears', 'Stator', 'Field Coil', 'Carbon Brush', 'Switch', 'Bearing'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-[9px] font-black text-gray-500/80 dark:text-gray-400 uppercase tracking-widest hover:border-orange-500/50 border border-transparent transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-900 dark:text-white">{displayedProducts.length}</span> of {filteredProducts.length} Items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {displayedProducts.map(product => (
              <div key={product.id} className="hover-lift group flex flex-col h-full bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 transition-all duration-500 overflow-hidden">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800/50 m-2 rounded-[1.5rem] p-6 transition-colors group-hover:bg-white dark:group-hover:bg-gray-800">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform transition-all duration-700 ease-out will-change-transform"
                  />

                  {/* Stock Badge */}
                  {product.stock < 10 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Low Stock: {product.stock}
                    </div>
                  )}

                  {/* Category Overlay (Mobile only small tag) */}
                  <div className="absolute top-4 left-4 lg:hidden">
                    <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                      {product.category || 'Spare Part'}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <div className="mb-4">
                    <span className="hidden lg:block text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase mb-2">
                      {product.category || 'General Spare'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-[1.2] group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[2.4em]">
                      {product.name}
                    </h3>
                  </div>

                  {/* Product Technical Description */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed italic">
                      {product.description || "High-performance technical grade machinery component designed for industrial durability."}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'text-orange-400 fill-orange-400' : 'text-gray-300 dark:text-gray-700'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Choice</span>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                      <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addedId === product.id}
                      className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 ${addedId === product.id
                        ? 'bg-green-600 text-white shadow-xl shadow-green-600/20'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white shadow-xl shadow-black/5'
                        }`}
                    >
                      {addedId === product.id ? (
                        'In Bag'
                      ) : (
                        <>
                          <Plus size={16} strokeWidth={3} /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-gray-800 mb-8 shadow-xl">
                  <Search className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">Zero Matches Found</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">We couldn't find any results for your current filters. Try refining your search parameters.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > itemsPerPage && (
            <div className="mt-16 flex justify-center items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="px-6 h-12 flex items-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Page <span className="text-gray-900 dark:text-white">{currentPage}</span> / {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
        <div className="group bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Certified Authentic</h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            100% Genuine spare parts sourced directly from authorized factory floors and verified distributors.
          </p>
        </div>
        <div className="group bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:rotate-6">
            <RefreshCw className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Rapid Logistics</h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Precision logistics ensures your machinery components are dispatched within 24 hours of confirmation.
          </p>
        </div>
        <div className="group bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 md:col-span-2 lg:col-span-1">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Elite Security</h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Full-spectrum encryption and verified payment gateways for professional industrial procurement.
          </p>
        </div>
      </div>

      <div className="pt-12">
        <Testimonials />
      </div>

      {/* SEO Semantic Content Section */}
      <section className="mt-20 py-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-[3rem] border border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Technical Expertise & Support</h2>
            <div className="h-1.5 w-24 bg-orange-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-orange-600">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"><Terminal size={24} /></div>
                <h4 className="text-sm font-black uppercase tracking-widest">Angle Grinder Care</h4>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Maximize the life of your <strong>GWS 600</strong> and <strong>GWS 900</strong> grinders. Regularly check <strong>carbon brushes</strong> every 100 hours of operation. Using genuine <strong>Ansar Tool gears</strong> ensures high-torque performance without overheating.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"><Database size={24} /></div>
                <h4 className="text-sm font-black uppercase tracking-widest">Drill Bit & Armature</h4>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                For <strong>GSB 500 RE</strong> or heavy-duty hammer drills, the <strong>armature commutator</strong> is critical. Our 100% copper winded armatures provide superior conductivity and resistance against voltage fluctuations in <strong>Indian power grids</strong>.
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-green-600">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"><Shield size={24} /></div>
                <h4 className="text-sm font-black uppercase tracking-widest">Marble Cutter Stators</h4>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Industrial cutters like <strong>GDM 13-34</strong> require stable magnetic fields. A genuine <strong>stator field coil</strong> prevents winding burnouts during continuous heavy-duty masonry work across <strong>construction sites in India</strong>.
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-500 dark:text-gray-400 font-medium leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Flashlight size={20} className="text-orange-500" /> Professional Industry Insight
            </h3>
            <p>
              Ansar Power Tools is India's premier destination for high-quality <strong>machine spare parts</strong> and professional <strong>power tool machines</strong>. We specialize in providing a comprehensive range of components for every industrial need, from <strong>angle grinder spare parts</strong> to <strong>heavy-duty drill machine components</strong>.
            </p>
            <p>
              Our inventory includes 100% genuine <strong>armatures, field coils, carbon brushes, and gears</strong> for leading brands like <strong>Bosch, Makita, and Dongcheng</strong>. Whether you are looking for a <strong>marble cutter armature in West Bengal</strong> or the <strong>best price for a professional grinder machine</strong>, Ansar Tools ensures uncompromising quality and rapid pan-India delivery.
            </p>
            <p>
              Based in Bansberia, we serve both wholesale and retail customers across the country, ensuring that your machinery never stays idle. Explore our catalog for <strong>spare parts of all machines</strong>, including stators, switches, and high-precision gear sets designed for industrial endurance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
