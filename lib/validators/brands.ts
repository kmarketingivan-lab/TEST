import { z } from "zod/v4";

const slugRegex = /^[a-z0-9-]+$/;

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Il nome non può superare 100 caratteri"),
  slug: z
    .string()
    .min(1, "Lo slug è obbligatorio")
    .regex(slugRegex, "Lo slug può contenere solo lettere minuscole, numeri e trattini"),
  logo_url: z.string().url("URL logo non valido").nullish(),
  website_url: z.string().url("URL sito non valido").nullish(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;
