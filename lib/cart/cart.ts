import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Cart, CartItem, CartWithPrices, CartItemWithPrice } from "./types";

const CART_COOKIE = "cart";
const CART_DB_KEY = "cart_items";
const HMAC_ALGO = "sha256";

/**
 * Get the HMAC secret from environment.
 */
function getHmacSecret(): string {
  const secret = process.env.HMAC_SECRET;
  if (!secret) {
    throw new Error("HMAC_SECRET environment variable is required");
  }
  return secret;
}

/**
 * Sign cart data with HMAC-SHA256.
 */
function signCart(items: CartItem[]): string {
  const payload = JSON.stringify(items);
  return createHmac(HMAC_ALGO, getHmacSecret()).update(payload).digest("hex");
}

/**
 * Verify HMAC signature of cart data.
 */
function verifySignature(items: CartItem[], signature: string): boolean {
  const expected = signCart(items);
  return expected === signature;
}

/**
 * Get the current user ID if authenticated (lightweight check).
 */
async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Read cart from DB for a given user ID.
 */
async function getCartFromDb(userId: string): Promise<CartItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", `${CART_DB_KEY}_${userId}`)
      .single();

    if (!data) return [];
    const items = (data as { value: unknown }).value;
    if (!Array.isArray(items)) return [];
    return items as CartItem[];
  } catch {
    return [];
  }
}

/**
 * Save cart to DB for a given user ID.
 */
async function saveCartToDb(userId: string, items: CartItem[]): Promise<void> {
  try {
    const supabase = await createClient();
    const key = `${CART_DB_KEY}_${userId}`;
    await supabase
      .from("site_settings")
      .upsert({ key, value: items as unknown }, { onConflict: "key" });
  } catch (err) {
    logger.warn("Failed to save cart to DB", { error: err instanceof Error ? err.message : "Unknown" });
  }
}

/**
 * Read cart from cookie, verifying HMAC signature.
 */
async function getCartFromCookie(): Promise<CartItem[]> {
  try {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE);

    if (!cartCookie?.value) return [];

    const cart: Cart = JSON.parse(cartCookie.value) as Cart;

    if (!cart.items || !Array.isArray(cart.items)) return [];

    if (!verifySignature(cart.items, cart.signature)) {
      logger.warn("Cart HMAC verification failed — tampered cookie detected");
      return [];
    }

    return cart.items;
  } catch {
    logger.warn("Failed to parse cart cookie");
    return [];
  }
}

/**
 * Merge two carts, summing quantities for matching product+variant.
 */
function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...a, ...b]) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, { ...item });
    }
  }
  return Array.from(map.values());
}

/**
 * Get the current cart. If logged in, merges cookie + DB cart.
 */
export async function getCart(): Promise<CartItem[]> {
  const cookieItems = await getCartFromCookie();
  const userId = await getAuthUserId();

  if (!userId) return cookieItems;

  // Logged in: merge cookie with DB cart
  const dbItems = await getCartFromDb(userId);

  if (cookieItems.length === 0) return dbItems;
  if (dbItems.length === 0) {
    // First login with cookie cart: persist to DB
    if (cookieItems.length > 0) {
      await saveCartToDb(userId, cookieItems);
    }
    return cookieItems;
  }

  // Merge both
  const merged = mergeCarts(dbItems, cookieItems);
  await saveCartToDb(userId, merged);
  await setCart(merged);
  return merged;
}

/**
 * Save cart items to signed HMAC cookie and DB (if logged in).
 */
export async function setCart(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  const signature = signCart(items);
  const cart: Cart = { items, signature };

  cookieStore.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Also persist to DB for logged-in users
  const userId = await getAuthUserId();
  if (userId) {
    await saveCartToDb(userId, items);
  }
}

/**
 * Add a product to the cart. If already present, increment quantity.
 */
export async function addToCart(
  productId: string,
  variantId: string | null,
  quantity: number = 1
): Promise<void> {
  const items = await getCart();

  const existing = items.find(
    (i) => i.productId === productId && i.variantId === variantId
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, variantId, quantity });
  }

  await setCart(items);
}

/**
 * Update the quantity of a cart item. Removes item if quantity is 0.
 */
export async function updateQuantity(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  let items = await getCart();

  if (quantity <= 0) {
    items = items.filter(
      (i) => !(i.productId === productId && i.variantId === variantId)
    );
  } else {
    const existing = items.find(
      (i) => i.productId === productId && i.variantId === variantId
    );
    if (existing) {
      existing.quantity = quantity;
    }
  }

  await setCart(items);
}

/**
 * Remove a product from the cart.
 */
export async function removeFromCart(
  productId: string,
  variantId: string | null
): Promise<void> {
  const items = await getCart();
  const filtered = items.filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  await setCart(filtered);
}

/**
 * Clear all items from the cart.
 */
export async function clearCart(): Promise<void> {
  await setCart([]);
}

/**
 * Calculate shipping cost based on country, weight, and subtotal.
 * Uses site_settings "shipping_zones" config or falls back to flat rates.
 */
async function calculateShipping(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  country: string | undefined,
  weightGrams: number,
  subtotal: number
): Promise<number> {
  try {
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "shipping_zones")
      .single();

    if (setting) {
      const zones = (setting as { value: unknown }).value as Array<{
        countries: string[];
        name: string;
        base_cost: number;
        per_kg?: number;
        free_above?: number;
      }>;

      if (Array.isArray(zones) && country) {
        const zone = zones.find((z) =>
          z.countries.map((c) => c.toUpperCase()).includes(country.toUpperCase())
        );

        if (zone) {
          if (zone.free_above && subtotal >= zone.free_above) return 0;
          const kgCost = zone.per_kg ? (weightGrams / 1000) * zone.per_kg : 0;
          return Math.round((zone.base_cost + kgCost) * 100) / 100;
        }
      }
    }
  } catch {
    // Fall through to defaults
  }

  // Default: free shipping over €50, else flat €5.90
  if (subtotal >= 50) return 0;
  return 5.9;
}

/**
 * Apply coupon discount to subtotal.
 */
function applyCouponDiscount(
  subtotal: number,
  coupon: { discount_percent?: number; discount_fixed?: number } | null
): number {
  if (!coupon) return 0;
  if (coupon.discount_percent) {
    return Math.round(subtotal * (coupon.discount_percent / 100) * 100) / 100;
  }
  if (coupon.discount_fixed) {
    return Math.min(coupon.discount_fixed, subtotal);
  }
  return 0;
}

/**
 * Calculate cart totals by reading EVERY price from DB.
 * Never trusts client-side prices.
 * Includes shipping, coupon discount, and stock info.
 */
export async function calculateTotals(
  items: CartItem[],
  couponCode?: string | null,
  country?: string
): Promise<CartWithPrices> {
  if (items.length === 0) {
    return { items: [], subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 };
  }

  const supabase = await createClient();

  // Get all product prices and stock from DB
  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, weight_grams")
    .in("id", productIds);

  // Get variant price adjustments and stock if any variants
  const variantIds = items
    .map((i) => i.variantId)
    .filter((v): v is string => v !== null);

  const variantMap: Record<string, { price_adjustment: number; name: string; stock_quantity: number }> = {};
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, name, price_adjustment, stock_quantity")
      .in("id", variantIds);

    for (const v of variants ?? []) {
      const variant = v as { id: string; name: string; price_adjustment: number; stock_quantity: number };
      variantMap[variant.id] = {
        price_adjustment: variant.price_adjustment,
        name: variant.name,
        stock_quantity: variant.stock_quantity,
      };
    }
  }

  // Build product map
  const productMap: Record<string, { name: string; price: number; stock_quantity: number; weight_grams: number | null }> = {};
  for (const p of products ?? []) {
    const product = p as { id: string; name: string; price: number; stock_quantity: number; weight_grams: number | null };
    productMap[product.id] = { name: product.name, price: product.price, stock_quantity: product.stock_quantity, weight_grams: product.weight_grams };
  }

  // Calculate item totals
  const itemsWithPrices: CartItemWithPrice[] = [];
  let subtotal = 0;
  let totalWeight = 0;

  for (const item of items) {
    const product = productMap[item.productId];
    if (!product) continue;

    let price = product.price;
    let name = product.name;
    let stock = product.stock_quantity;

    if (item.variantId) {
      const variant = variantMap[item.variantId];
      if (variant) {
        price += variant.price_adjustment;
        name = `${product.name} - ${variant.name}`;
        stock = variant.stock_quantity;
      }
    }

    const total = price * item.quantity;
    subtotal += total;
    totalWeight += (product.weight_grams ?? 0) * item.quantity;

    itemsWithPrices.push({
      ...item,
      name,
      price,
      total,
      stock,
    });
  }

  // Get tax rate from settings
  const { data: taxSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "tax_rate")
    .single();

  const taxRate = taxSetting
    ? Number((taxSetting as { value: unknown }).value) / 100
    : 0.22; // Default 22% Italian VAT

  // Validate and apply coupon
  let couponData: { discount_percent?: number; discount_fixed?: number } | null = null;
  let couponLabel: string | null = null;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    try {
      const { data: couponSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "coupons")
        .single();

      if (couponSetting) {
        const coupons = (couponSetting as { value: unknown }).value as Array<{
          code: string;
          label: string;
          discount_percent?: number;
          discount_fixed?: number;
          active?: boolean;
          min_order?: number;
        }>;

        if (Array.isArray(coupons)) {
          const coupon = coupons.find(
            (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.active !== false
          );
          if (coupon && (!coupon.min_order || subtotal >= coupon.min_order)) {
            const cd: { discount_percent?: number; discount_fixed?: number } = {};
            if (coupon.discount_percent !== undefined) cd.discount_percent = coupon.discount_percent;
            if (coupon.discount_fixed !== undefined) cd.discount_fixed = coupon.discount_fixed;
            couponData = cd;
            couponLabel = coupon.label;
            appliedCouponCode = coupon.code;
          }
        }
      }
    } catch {
      // Coupon validation failed, continue without discount
    }
  }

  const discount = applyCouponDiscount(subtotal, couponData);
  const discountedSubtotal = subtotal - discount;
  const tax = Math.round(discountedSubtotal * taxRate * 100) / 100;
  const shipping = await calculateShipping(supabase, country, totalWeight, discountedSubtotal);
  const total = Math.round((discountedSubtotal + tax + shipping) * 100) / 100;

  return {
    items: itemsWithPrices,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    couponCode: appliedCouponCode,
    couponLabel,
  };
}
