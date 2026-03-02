"use server";

import { getCurrentUser } from "@/lib/auth/helpers";
import { addToWishlist, removeFromWishlist } from "@/lib/dal/wishlists";

export async function toggleWishlistAction(
  productId: string,
  currentlyInWishlist: boolean
): Promise<{ success: boolean } | { error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Devi effettuare il login" };

    if (currentlyInWishlist) {
      await removeFromWishlist(user.id, productId);
    } else {
      await addToWishlist(user.id, productId);
    }

    return { success: true };
  } catch {
    return { error: "Errore nell'aggiornamento della lista desideri" };
  }
}
