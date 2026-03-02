import { z } from "zod/v4";

export const addressSchema = z.object({
  label: z.string().max(50, "L'etichetta non può superare 50 caratteri").default("Casa"),
  full_name: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  phone: z.string().max(30, "Il telefono non può superare 30 caratteri").nullish(),
  street: z
    .string()
    .min(2, "L'indirizzo deve avere almeno 2 caratteri")
    .max(200, "L'indirizzo non può superare 200 caratteri"),
  city: z
    .string()
    .min(2, "La città deve avere almeno 2 caratteri")
    .max(100, "La città non può superare 100 caratteri"),
  province: z
    .string()
    .min(2, "La provincia deve avere almeno 2 caratteri")
    .max(100, "La provincia non può superare 100 caratteri"),
  postal_code: z
    .string()
    .min(3, "Il CAP deve avere almeno 3 caratteri")
    .max(10, "Il CAP non può superare 10 caratteri"),
  country: z.string().default("IT"),
  is_default: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
