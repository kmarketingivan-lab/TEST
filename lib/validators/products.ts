import { z } from "zod/v4";

/** Regex for valid slugs: lowercase alphanumeric with hyphens */
const slugRegex = /^[a-z0-9-]+$/;

/**
 * Zod schema for product creation/update.
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(200, "Il nome non può superare 200 caratteri"),
  slug: z
    .string()
    .min(1, "Lo slug è obbligatorio")
    .regex(slugRegex, "Lo slug può contenere solo lettere minuscole, numeri e trattini"),
  description: z.string().nullish(),
  rich_description: z.string().nullish(),
  price: z
    .number()
    .nonnegative("Il prezzo deve essere >= 0"),
  compare_at_price: z.number().nonnegative("Il prezzo di confronto deve essere >= 0").nullish(),
  cost_price: z.number().nonnegative("Il prezzo di costo deve essere >= 0").nullish(),
  sku: z.string().nullish(),
  barcode: z.string().nullish(),
  stock_quantity: z
    .number()
    .int("La quantità deve essere un intero")
    .nonnegative("La quantità non può essere negativa")
    .default(0),
  low_stock_threshold: z.number().int().nonnegative().default(5),
  weight_grams: z.number().int().nonnegative().nullish(),
  category_id: z.uuid("ID categoria non valido").nullish(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  seo_title: z.string().max(70, "Il titolo SEO non può superare 70 caratteri").nullish(),
  seo_description: z.string().max(160, "La descrizione SEO non può superare 160 caratteri").nullish(),
});

export type ProductInput = z.infer<typeof productSchema>;
