import { supabase, Product, CartItem, Order } from './supabase';

export const supabaseMarketplaceService = {
  // Get all products
  async getProducts(category?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  },

  // Cart operations
  async getCart(): Promise<CartItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
      return [];
    }

    return data || [];
  },

  async addToCart(productId: string, quantity = 1): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      return !error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert([{ user_id: user.id, product_id: productId, quantity }]);

      return !error;
    }
  },

  async updateCartQuantity(cartItemId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    return !error;
  },

  async removeFromCart(cartItemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    return !error;
  },

  async clearCart(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    return !error;
  },

  // Order operations
  async createOrder(items: any[], total: number): Promise<Order | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('orders')
      .insert([{ user_id: user.id, items, total, status: 'pending' }])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return null;
    }

    // Clear cart after order
    await this.clearCart();

    return data;
  },

  async getOrders(): Promise<Order[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  }
};
