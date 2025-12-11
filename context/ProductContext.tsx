
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category } from '../types';
import { supabase } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating'>) => Promise<{ error: any }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  addCategory: (name: string) => Promise<{ error: any }>;
  deleteCategory: (id: string) => Promise<{ error: any }>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
      ]);

      // Process Products
      const { data: prodData, error: prodError } = productsResult;

      if (prodError) throw prodError;

      // Map DB snake_case to frontend camelCase
      const mappedProducts: Product[] = (prodData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency,
        sku: item.sku,
        stock: item.stock,
        category: item.category,
        imageUrl: item.image_url,
        rating: item.rating,
        createdAt: item.created_at
      }));

      setProducts(mappedProducts);
      localStorage.setItem('products_cache', JSON.stringify(mappedProducts));

      // Process Categories
      const { data: catData, error: catError } = categoriesResult;

      if (catError) {
        const isTableMissing = catError.code === '42P01' ||
          catError.message.includes('Could not find the table') ||
          catError.message.includes('schema cache');

        if (!isTableMissing) {
          console.error('Error fetching categories:', catError.message);
        }

        // Fallback defaults if not cached or error
        if (categories.length === 0) {
          const defaults = [
            { id: 'def-1', name: 'Drills' },
            { id: 'def-2', name: 'Saws' },
            { id: 'def-3', name: 'Grinders' },
            { id: 'def-4', name: 'Vacuums' },
            { id: 'def-5', name: 'Measuring' },
            { id: 'def-6', name: 'Hand Tools' }
          ];
          setCategories(defaults);
        }
      } else {
        setCategories(catData || []);
        localStorage.setItem('categories_cache', JSON.stringify(catData || []));
      }

    } catch (err: any) {
      console.error('Error fetching data:', err.message || err);
      // Only set error if we don't have data (i.e., not a background refresh or no cache)
      if (products.length === 0) {
        setError(err.message || 'An unexpected network error occurred.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt to load from cache first for instant render
    try {
      const cachedProducts = localStorage.getItem('products_cache');
      const cachedCategories = localStorage.getItem('categories_cache');

      if (cachedProducts && cachedCategories) {
        setProducts(JSON.parse(cachedProducts));
        setCategories(JSON.parse(cachedCategories));
        setLoading(false); // Immediate display
        fetchProducts(true); // Background refresh
      } else {
        fetchProducts(false); // Normal load
      }
    } catch (e) {
      // Fallback to normal load if cache parsing fails
      fetchProducts(false);
    }
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'rating'>) => {
    const dbProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      sku: product.sku,
      stock: product.stock,
      category: product.category,
      image_url: product.imageUrl,
      rating: 5.0
    };

    const { error } = await supabase.from('products').insert([dbProduct]);
    if (error) {
      console.error("Error adding product:", error.message);
    } else {
      await fetchProducts();
    }
    return { error };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (!error) {
      await fetchProducts();
    }
    return { error };
  };

  const deleteProduct = async (id: string) => {
    try {
      // Use select() to verify the row was actually returned (deleted)
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) return { error };

      // If no data returned, it means deletion didn't happen (possibly RLS or ID not found)
      if (!data || data.length === 0) {
        return {
          error: { message: "Permission denied or product not found. Ensure you are an Admin." }
        };
      }

      // Optimistic update
      setProducts(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const addCategory = async (name: string) => {
    const { error } = await supabase.from('categories').insert([{ name }]);
    if (!error) await fetchProducts();
    return { error };
  };

  const deleteCategory = async (id: string) => {
    const { data, error } = await supabase.from('categories').delete().eq('id', id).select();

    if (error) return { error };
    if (!data || data.length === 0) return { error: { message: "Failed to delete category." } };

    // Update local state immediately
    setCategories(prev => prev.filter(c => c.id !== id));
    return { error: null };
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      loading,
      error,
      refreshProducts: fetchProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      deleteCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
