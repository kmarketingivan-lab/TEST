/**
 * Cart item stored in the cookie — NO price, always read from DB.
 */
export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/**
 * Cart stored in the signed HMAC cookie.
 */
export interface Cart {
  items: CartItem[];
  signature: string;
}

/**
 * Cart item enriched with prices read from DB.
 */
export interface CartItemWithPrice extends CartItem {
  name: string;
  price: number;
  total: number;
  stock?: number;
}

/**
 * Cart with all prices calculated from DB.
 */
export interface CartWithPrices {
  items: CartItemWithPrice[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  couponCode?: string | null;
  couponLabel?: string | null;
}
