"use server";

import { addToCart, updateQuantity, removeFromCart, clearCart } from "./cart";
import { logger } from "@/lib/utils/logger";
import { rateLimitByIp } from "@/lib/utils/rate-limit";

/**
 * Server action to add a product to the cart.
 * @param productId - Product UUID
 * @param variantId - Variant UUID or null
 * @param quantity - Quantity to add
 * @returns Success or error result
 */
export async function addToCartAction(
  productId: string,
  variantId: string | null,
  quantity: number = 1
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };
    if (quantity < 1 || !Number.isInteger(quantity)) {
      return { error: "La quantità deve essere un intero positivo" };
    }

    const { success: allowed } = await rateLimitByIp("cart", "default");
    if (!allowed) {
      return { error: "Troppe richieste. Riprova tra poco." };
    }

    await addToCart(productId, variantId, quantity);
    return { success: true };
  } catch (err) {
    logger.error("addToCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nell'aggiunta al carrello" };
  }
}

/**
 * Server action to update cart item quantity.
 * @param productId - Product UUID
 * @param variantId - Variant UUID or null
 * @param quantity - New quantity (0 to remove)
 * @returns Success or error result
 */
export async function updateCartAction(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };
    if (quantity < 0 || !Number.isInteger(quantity)) {
      return { error: "La quantità deve essere un intero non negativo" };
    }

    await updateQuantity(productId, variantId, quantity);
    return { success: true };
  } catch (err) {
    logger.error("updateCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nell'aggiornamento del carrello" };
  }
}

/**
 * Server action to remove a product from the cart.
 * @param productId - Product UUID
 * @param variantId - Variant UUID or null
 * @returns Success or error result
 */
export async function removeFromCartAction(
  productId: string,
  variantId: string | null
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!productId) return { error: "ID prodotto richiesto" };

    await removeFromCart(productId, variantId);
    return { success: true };
  } catch (err) {
    logger.error("removeFromCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nella rimozione dal carrello" };
  }
}

/**
 * Server action to clear the entire cart.
 * @returns Success or error result
 */
export async function clearCartAction(): Promise<{ success: boolean } | { error: string }> {
  try {
    await clearCart();
    return { success: true };
  } catch (err) {
    logger.error("clearCartAction error", { error: err instanceof Error ? err.message : "Unknown" });
    return { error: "Errore nello svuotamento del carrello" };
  }
}
