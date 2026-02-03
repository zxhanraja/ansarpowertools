
import React, { useState, useMemo, useEffect } from 'react';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { OrderStatus, Product } from '../types';
import { supabase } from '../lib/supabase';
import {
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  ShieldOff,
  Database,
  Pencil,
  FolderTree,
  AlignLeft,
  Tag,
  Layers,
  Crop,
  Maximize,
  User
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/imageUtils';

const DEFAULT_PRODUCT_STATE: Partial<Product> = {
  name: '',
  description: '',
  price: 0,
  currency: 'INR',
  sku: '',
  stock: 0,
  category: '',
  imageUrl: ''
};

export const Admin: React.FC = () => {
  const { orders, updateOrderStatus } = useOrder();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    loading: productsLoading
  } = useProduct();
  const { isAdmin, user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'categories'>('orders');

  // Orders State
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('FedEx');
  const [searchTerm, setSearchTerm] = useState('');

  // Inventory State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>(DEFAULT_PRODUCT_STATE);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Category State
  const [newCategory, setNewCategory] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Loading Timeout State
  const [showSlowLoadingMsg, setShowSlowLoadingMsg] = useState(false);
  const [forceDiagnostic, setForceDiagnostic] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (authLoading) {
      // If loading takes more than 3 seconds, show the troubleshoot button
      timer = setTimeout(() => {
        setShowSlowLoadingMsg(true);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Calculate Dashboard Stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingShipments = orders.filter(o => o.status === OrderStatus.PAID).length;
    const lowStockItems = products.filter(p => p.stock < 10);

    return {
      totalRevenue,
      totalOrders,
      pendingShipments,
      lowStockItems,
      revenueChange: '+12.5%',
      ordersChange: '+8.2%'
    };
  }, [orders, products]);

  const DiagnosticScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-800">
        <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <Database className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Database Connection Issue</h2>
            <p className="text-gray-500">The system is unable to verify your Admin Role from the database.</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-blue-700 font-medium text-sm">Please run the SQL Setup Script.</p>
          </div>
          <div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'name', 'ADMIN'
FROM auth.users
WHERE email = 'foltairezzzz@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN';`);
                alert("SQL Copied to Clipboard!");
              }}
              className="bg-gray-800 text-white p-3 rounded w-full hover:bg-gray-700"
            >
              Copy Admin Fix SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (authLoading) {
    if (forceDiagnostic) return <DiagnosticScreen />;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
          <p className="text-gray-500 font-medium">Verifying Admin Access...</p>
          {showSlowLoadingMsg && (
            <button
              onClick={() => setForceDiagnostic(true)}
              className="mt-4 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-800"
            >
              Troubleshoot Database
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    if (user?.email === 'foltairezzzz@gmail.com' || forceDiagnostic) return <DiagnosticScreen />;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <ShieldOff className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        </div>
      </div>
    );
  }

  const handleShipOrder = (orderId: string) => {
    if (!trackingInput) return alert("Please enter a tracking number");
    updateOrderStatus(orderId, OrderStatus.SHIPPED, trackingInput, courierInput);
    setSelectedOrder(null);
    setTrackingInput('');
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED: return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadCroppedImage = async () => {
    try {
      setUploadingImage(true);
      if (!imageSrc || !croppedAreaPixels) return;

      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `${Math.random()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, croppedImageBlob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, imageUrl: data.publicUrl }));
      setIsCropping(false);
      setImageSrc(null);
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductForm(DEFAULT_PRODUCT_STATE);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      sku: product.sku,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving product...", productForm);

    if (!productForm.name) {
      alert("Product Name is required");
      return;
    }
    if (productForm.price === undefined || productForm.price < 0) {
      alert("Valid Price is required");
      return;
    }

    const productData = {
      name: productForm.name!,
      description: productForm.description || '',
      price: Number(productForm.price),
      currency: 'INR',
      sku: productForm.sku || `SKU-${Date.now()}`,
      stock: Number(productForm.stock),
      category: productForm.category || 'Spare Parts',
      imageUrl: productForm.imageUrl || 'https://via.placeholder.com/400'
    };

    let result;
    try {
      if (isEditing && editingId) {
        console.log("Updating product:", editingId);
        result = await updateProduct(editingId, productData);
      } else {
        console.log("Adding new product");
        result = await addProduct(productData);
      }

      console.log("Save result:", result);

      if (result.error) {
        console.error("Operation failed:", result.error);
        alert(`Error: ${result.error.message || JSON.stringify(result.error)}`);
      } else {
        alert("Success! Product saved.");
        setIsProductModalOpen(false);
        setProductForm(DEFAULT_PRODUCT_STATE);
      }
    } catch (err: any) {
      console.error("Unexpected error in handleSaveProduct:", err);
      alert("Unexpected error: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeletingId(id);
      console.log("Attempting delete for:", id);
      const { error } = await deleteProduct(id);

      if (error) {
        console.error("Delete failed:", error);
        if (error.code === '23503') {
          alert("Cannot delete: Product is part of an existing order history. \n\nFix: Please run the SQL Setup Script to enable 'Safe Deletion' (ON DELETE SET NULL).");
        } else if (error.message?.includes('Permission denied')) {
          alert("Failed to delete: Permission denied. \n\nFix: Please run the SQL Setup Script to update Admin Policies.");
        } else {
          alert("Failed to delete: " + (error.message || JSON.stringify(error)));
        }
      } else {
        alert("Product deleted successfully.");
      }
    } catch (e: any) {
      alert("Unexpected error: " + e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCategoryLoading(true);
    const { error } = await addCategory(newCategory.trim());
    setCategoryLoading(false);
    if (error) {
      alert("Error adding category: " + error.message);
    } else {
      setNewCategory('');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      setDeletingCategoryId(id);
      const { error } = await deleteCategory(id);
      if (error) {
        alert("Error deleting category: " + (error.message || JSON.stringify(error)));
      } else {
        alert("Category deleted successfully.");
      }
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500">Welcome back, {user?.name || 'Administrator'}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-200 shadow-sm">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="h-6 w-6 text-green-600" /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stats.revenueChange}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-lg"><ShoppingBag className="h-6 w-6 text-blue-600" /></div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.ordersChange}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-lg"><Package className="h-6 w-6 text-orange-600" /></div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pending Shipments</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingShipments}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-lg"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
            {stats.lowStockItems.length > 0 && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Action Needed</span>}
          </div>
          <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStockItems.length}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto bg-white rounded-t-xl px-4">
        <nav className="-mb-px flex space-x-8">
          <button onClick={() => setActiveTab('orders')} className={`${activeTab === 'orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Order Management</button>
          <button onClick={() => setActiveTab('inventory')} className={`${activeTab === 'inventory' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Inventory Management</button>
          <button onClick={() => setActiveTab('categories')} className={`${activeTab === 'categories' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Category Management</button>
        </nav>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Recent Orders</h2>
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">No order data available yet.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{order.orderNumber}</div>
                          <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 mt-0.5"><User size={10} /> {order.shippingDetails.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium text-center">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-inset ${getStatusColor(order.status)} ring-opacity-20 shadow-sm transition-all`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-black text-right">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {order.status === OrderStatus.PAID && (
                            <button onClick={() => setSelectedOrder(order.id)} className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ml-auto shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                              <Truck size={14} /> Ship
                            </button>
                          )}
                          {order.status === OrderStatus.SHIPPED && (
                            <button onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)} className="bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ml-auto shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                              <CheckCircle size={14} /> Finish
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Product Inventory</h2>
            <button onClick={openAddModal} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/30"><Plus className="h-5 w-5" /> Add Product</button>
          </div>
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Information</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest center">Category</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest center">SKU</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {productsLoading ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold animate-pulse">Scanning Inventory...</td></tr>) :
                    products.length === 0 ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found in catalog.</td></tr>) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 shrink-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-1.5 shadow-sm">
                                <img className="h-full w-full object-contain" src={product.imageUrl || 'https://via.placeholder.com/50'} alt="" />
                              </div>
                              <div>
                                <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-bold text-center">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] uppercase font-black">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono font-bold text-center uppercase tracking-tighter">{product.sku}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-black text-right">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${product.stock < 10 ? 'bg-red-50 text-red-600 ring-red-600/20' : 'bg-green-50 text-green-600 ring-green-600/20'}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(product)} className="p-2 bg-gray-100 dark:bg-gray-800 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-90" title="Edit Catalog Entry"><Pencil size={14} /></button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deletingId === product.id}
                                className="p-2 bg-gray-100 dark:bg-gray-800 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all active:scale-90 disabled:opacity-50"
                                title="Purge Record"
                              >
                                {deletingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FolderTree className="text-orange-600" />
              Manage Categories
            </h3>
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="New Category Name (e.g. Spare Parts)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
              />
              <button
                type="submit"
                disabled={categoryLoading}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
              >
                {categoryLoading ? 'Adding...' : 'Add'}
              </button>
            </form>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No categories found.</p>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      disabled={deletingCategoryId === cat.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors disabled:opacity-100 flex items-center gap-1.5"
                      title="Delete Category"
                    >
                      {deletingCategoryId === cat.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      <span className="text-xs font-bold">Delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shipment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2"><Truck className="text-orange-600" /> Ship Order</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Courier Service</label>
                <select value={courierInput} onChange={(e) => setCourierInput(e.target.value)} className="w-full bg-white border-gray-200 rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"><option value="FedEx">FedEx Express</option><option value="BlueDart">BlueDart</option><option value="Delhivery">Delhivery</option><option value="DTDC">DTDC</option></select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="e.g. 1234567890" className="w-full bg-white border-gray-200 rounded-lg border px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleShipOrder(selectedOrder)} className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] overflow-y-auto animate-in fade-in duration-300">
          <div className="flex min-h-full items-start justify-center px-4 py-12 sm:p-20">
            <div className="relative bg-white dark:bg-gray-950 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
              <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl">
                    {isEditing ? <Pencil className="h-5 w-5 text-orange-600" /> : <Plus className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{isEditing ? 'Sync Product Specs' : 'Register New Asset'}</h3>
                    <p className="text-[9px] text-orange-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">Ansar Power Tools • Industrial Inventory</p>
                  </div>
                </div>
                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-gray-950/50">
                <form id="productForm" onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-200/50 dark:border-gray-800/50"><AlignLeft size={14} className="text-orange-500" /> Core Information</div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Product Name</label>
                          <input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-sm" placeholder="e.g. Angle Grinder M14" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                          <div className="relative">
                            <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-3 text-sm sm:text-base border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-sm appearance-none">
                              <option value="">Select category...</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <Layers className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Product Portfolio <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-bold">Minimalist</span>
                          </label>
                          <textarea
                            required
                            value={productForm.description}
                            onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                            className="w-full px-5 py-4 text-sm border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-48 resize-none transition-all shadow-inner font-medium placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            placeholder="Brief technical summary... (e.g. High-torque industrial motor with copper winding and heat-resistant housing)"
                          />
                          <p className="text-[9px] text-gray-400 font-bold italic ml-1">* This description appears prominently on the store catalog for customers.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-200/50 dark:border-gray-800/50"><Tag size={14} className="text-orange-500" /> Logistics & Pricing</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Price (₹)</label>
                          <input required type="number" min="0" value={productForm.price || ''} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Stock Qty</label>
                          <input required type="number" min="0" value={productForm.stock || ''} onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">SKU Code</label>
                        <input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-sm font-mono" placeholder="Auto-gen SKU" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-200/50 dark:border-gray-800/50"><ImageIcon size={14} className="text-orange-500" /> Merchandising</div>
                      <div className="relative group/img">
                        {productForm.imageUrl ? (
                          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-inner group">
                            <img src={productForm.imageUrl} className="w-full h-full object-contain bg-white dark:bg-gray-900" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all p-4 text-center backdrop-blur-sm">
                              <label className="cursor-pointer bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-transform mb-2">Change Image</label>
                              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Supports JPG, PNG, WEBP</p>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 hover:bg-orange-50 transition-all group-hover/img:border-orange-300">
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl mb-4 group-hover/img:scale-110 transition-transform">
                              <Upload className="h-8 w-8 text-orange-600" />
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Upload Product Image</span>
                            <span className="text-xs text-gray-400 mt-2 font-medium">Recommended: 800x600 (4:3)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-5 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <button onClick={() => setIsProductModalOpen(false)} className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-2 border-gray-100 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all">Cancel</button>
                <button type="submit" form="productForm" disabled={uploadingImage} className="w-full sm:w-auto px-10 py-3.5 text-sm bg-gray-900 dark:bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest">{isEditing ? 'Update Stock' : 'Add to Catalog'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl h-[400px] bg-black rounded-xl overflow-hidden mb-4 border border-gray-800">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4 text-gray-500" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsCropping(false); setImageSrc(null); }}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCroppedImage}
                disabled={uploadingImage}
                className="flex-1 py-2.5 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                {uploadingImage ? <Loader2 className="animate-spin h-5 w-5" /> : <Crop className="h-4 w-4" />}
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
