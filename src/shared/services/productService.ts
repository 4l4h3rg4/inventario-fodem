import { supabase } from '../config/supabase';

export interface Product {
  id: string;
  name: string;
  photo?: string;
  current_stock: number;
  min_recommended: number;
  ideal_amount: number;
  user_id: string;
  household_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  photo?: string;
  current_stock: number;
  min_recommended: number;
  ideal_amount: number;
  household_id: string;
}

export interface UpdateStockData {
  product_id: string;
  change_amount: number;
  change_type: 'add' | 'remove' | 'adjust';
}

export class ProductService {
  static async getHouseholdProducts(householdId: string): Promise<{ data: Product[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('household_id', householdId)
        .order('name');

      if (error) {
        return { data: null, error: 'Error al obtener productos' };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }

  static async createProduct(productData: CreateProductData): Promise<{ data: Product | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: 'Error al crear producto' };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }

  static async updateProductStock(stockData: UpdateStockData): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Obtener el producto actual
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('current_stock, household_id')
        .eq('id', stockData.product_id)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Producto no encontrado' };
      }

      // Calcular nuevo stock
      let newStock = product.current_stock;
      switch (stockData.change_type) {
        case 'add':
          newStock += stockData.change_amount;
          break;
        case 'remove':
          newStock -= stockData.change_amount;
          break;
        case 'adjust':
          newStock = stockData.change_amount;
          break;
      }

      // Actualizar stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', stockData.product_id);

      if (updateError) {
        return { success: false, error: 'Error al actualizar stock' };
      }

      // Registrar en historial
      await supabase
        .from('stock_history')
        .insert({
          product_id: stockData.product_id,
          change_amount: stockData.change_amount,
          change_type: stockData.change_type,
          previous_stock: product.current_stock,
          new_stock: newStock,
          user_id: user.id,
          household_id: product.household_id,
        });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
} 