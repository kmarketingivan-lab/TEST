"use server";

import { createReview } from "@/lib/dal/reviews";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function createReviewAction(
  productId: string,
  rating: number,
  title: string | null,
  body: string | null
): Promise<{ success: boolean } | { error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Devi effettuare il login per scrivere una recensione" };

    if (rating < 1 || rating > 5) return { error: "Valutazione non valida" };

    const reviewData: Parameters<typeof createReview>[0] = {
      product_id: productId,
      user_id: user.id,
      author_name: user.email.split("@")[0] ?? "Utente",
      rating,
    };
    if (title !== null) reviewData.title = title;
    if (body !== null) reviewData.body = body;

    await createReview(reviewData);

    return { success: true };
  } catch {
    return { error: "Errore nell'invio della recensione" };
  }
}
