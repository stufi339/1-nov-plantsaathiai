import type { CartItem, Cart } from './types';

class CartService {
  private storageKey = 'plant_saathi_cart';

  getCart(): Cart {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return { items: [], total: 0, itemCount: 0 };
  }

  addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): Cart {
    const cart = this.getCart();
    
    // Check if item already exists
    const existingIndex = cart.items.findIndex(i => i.product_id === item.product_id);
    
    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ ...item, quantity });
    }
    
    this.updateCartTotals(cart);
    this.saveCart(cart);
    return cart;
  }

  updateQuantity(productId: string, quantity: number): Cart {
    const cart = this.getCart();
    const item = cart.items.find(i => i.product_id === productId);
    
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
      this.updateCartTotals(cart);
      this.saveCart(cart);
    }
    
    return cart;
  }

  removeFromCart(productId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(i => i.product_id !== productId);
    this.updateCartTotals(cart);
    this.saveCart(cart);
    return cart;
  }

  clearCart(): Cart {
    const cart: Cart = { items: [], total: 0, itemCount: 0 };
    this.saveCart(cart);
    return cart;
  }

  private updateCartTotals(cart: Cart): void {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    // Dispatch event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
  }

  // Generate bulk order Amazon links
  generateBulkOrderLinks(): string[] {
    const cart = this.getCart();
    return cart.items.map(item => item.amazon_link);
  }

  // Generate bulk order text for sharing
  generateBulkOrderText(): string {
    const cart = this.getCart();
    let text = '🛒 Plant Saathi Bulk Order\n\n';
    
    cart.items.forEach((item, index) => {
      text += `${index + 1}. ${item.product_name}\n`;
      text += `   Quantity: ${item.quantity}\n`;
      text += `   Price: ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
      text += `   Link: ${item.amazon_link}\n\n`;
    });
    
    text += `Total Items: ${cart.itemCount}\n`;
    text += `Total Amount: ₹${cart.total.toFixed(2)}`;
    
    return text;
  }
}

export const cartService = new CartService();
