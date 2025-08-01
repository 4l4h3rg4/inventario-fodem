import { useState, useEffect } from 'react';
import { supabase } from '../../shared/config/supabase';
import { Database } from '../../shared/config/supabase';

import { logger } from '../../shared/utils/logger';
type Product = Database['public']['Tables']['products']['Row'];

export const useProducts = (householdId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (householdId) {
        query = query.eq('household_id', householdId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error adding product' };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error updating product' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error deleting product' };
    }
  };

  const getLowStockProducts = async () => {
    try {
      if (!householdId) return [];

      const { data, error } = await supabase
        .rpc('get_low_stock_products', { household_uuid: householdId });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error('Error getting low stock products:', err);
      return [];
    }
  };

  const generateShoppingList = async () => {
    try {
      if (!householdId) return [];

      const { data, error } = await supabase
        .rpc('generate_shopping_list', { household_uuid: householdId });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error('Error generating shopping list:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [householdId]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    generateShoppingList,
  };
}; 