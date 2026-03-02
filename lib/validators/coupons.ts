import { z } from "zod/v4";

export const couponSchema = z.object({
  code: z
    .string()
    .min(2, "Il codice deve avere almeno 2 caratteri")
    .max(50, "Il codice non può superare 50 caratteri"),
  description: z.string().max(500).nullish(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Il valore sconto deve essere > 0"),
  min_order_amount: z.number().nonnegative("L'importo minimo deve essere >= 0").default(0),
  max_uses: z.number().int().positive("Il numero massimo di usi deve essere > 0").nullish(),
  starts_at: z.string().nullish(),
  expires_at: z.string().nullish(),
  is_active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
