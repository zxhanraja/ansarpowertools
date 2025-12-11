
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
  Layers
} from 'lucide-react';

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
    try {
      setUploadingImage(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, imageUrl: data.publicUrl }));
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
    if (!productForm.name || !productForm.price) return;

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
    if (isEditing && editingId) {
      result = await updateProduct(editingId, productData);
    } else {
      result = await addProduct(productData);
    }

    if (result.error) {
      alert(`Error ${isEditing ? 'updating' : 'adding'} product: ` + result.error.message);
    } else {
      setIsProductModalOpen(false);
      setProductForm(DEFAULT_PRODUCT_STATE);
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="text-sm font-bold text-gray-900">{order.orderNumber}</div><div className="text-xs text-gray-500">{order.shippingDetails.fullName}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {order.status === OrderStatus.PAID && <button onClick={() => setSelectedOrder(order.id)} className="text-orange-600 hover:text-orange-900 font-bold inline-flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-md"><Truck className="h-4 w-4" /> Ship</button>}
                          {order.status === OrderStatus.SHIPPED && <button onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)} className="text-green-600 hover:text-green-900 font-bold inline-flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Complete</button>}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productsLoading ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>) :
                    products.length === 0 ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products.</td></tr>) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4"><div className="flex items-center"><div className="h-10 w-10 shrink-0 rounded-md bg-gray-100 border border-gray-200 overflow-hidden mr-3"><img className="h-full w-full object-cover" src={product.imageUrl || 'https://via.placeholder.com/50'} alt="" /></div><div className="text-sm font-medium text-gray-900">{product.name}</div></div></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold text-right">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-sm text-right"><span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{product.stock}</span></td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(product)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold text-xs border border-blue-200 transition-colors"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deletingId === product.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-bold text-xs border border-red-200 transition-colors disabled:opacity-50"
                              >
                                {deletingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                Delete
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
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
                <div className="px-4 py-3 sm:px-8 sm:py-5 border-b border-gray-200 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg">{isEditing ? <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />}</div>
                    <div><h3 className="text-lg sm:text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h3></div>
                  </div>
                  <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar bg-white">
                  <form id="productForm" onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2"><AlignLeft className="h-4 w-4 text-orange-500" /> Product Details</div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1.5"><label className="text-xs sm:text-sm font-medium text-gray-700">Product Name *</label><input required type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" /></div>
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-medium text-gray-700">Category</label>
                          <div className="relative">
                            <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 appearance-none">
                              <option value="">Select Category...</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <Layers className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5"><label className="text-xs sm:text-sm font-medium text-gray-700">Description</label><textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 h-28 sm:h-32 resize-none" /></div>
                      </div>
                    </div>
                    <div className="space-y-6 sm:space-y-8">
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2"><Tag className="h-4 w-4 text-orange-500" /> Pricing & Inventory</div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Price (INR)</label><input required type="number" min="0" value={productForm.price || ''} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" /></div>
                          <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">Stock Qty</label><input required type="number" min="0" value={productForm.stock || ''} onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" /></div>
                        </div>
                        <div className="space-y-1.5"><label className="text-xs font-bold text-gray-500 uppercase">SKU</label><input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900" placeholder="Auto-generated" /></div>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-200 pb-2"><ImageIcon className="h-4 w-4 text-orange-500" /> Product Image</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 hover:bg-gray-50 text-center bg-white transition-colors">
                          {uploadingImage ? <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto" /> :
                            productForm.imageUrl ? (
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200"><img src={productForm.imageUrl} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"><label className="cursor-pointer bg-white px-3 py-1 rounded text-sm font-bold">Change<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label></div></div>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center"><Upload className="h-6 w-6 text-gray-400 mb-2" /><span className="text-sm font-bold text-gray-700">Upload Image</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                            )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                  <button onClick={() => setIsProductModalOpen(false)} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" form="productForm" disabled={uploadingImage} className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">{isEditing ? 'Update Product' : 'Save Product'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
};
