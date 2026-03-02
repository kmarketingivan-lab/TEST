import { z } from "zod/v4";

export const wishlistSchema = z.object({
  product_id: z.uuid("ID prodotto non valido"),
});

export type WishlistInput = z.infer<typeof wishlistSchema>;
