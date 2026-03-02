import { z } from "zod/v4";

export const reviewSchema = z.object({
  product_id: z.uuid("ID prodotto non valido"),
  author_name: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  rating: z
    .number()
    .int("Il voto deve essere un intero")
    .min(1, "Il voto minimo è 1")
    .max(5, "Il voto massimo è 5"),
  title: z.string().max(200, "Il titolo non può superare 200 caratteri").nullish(),
  body: z.string().max(2000, "Il testo non può superare 2000 caratteri").nullish(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
