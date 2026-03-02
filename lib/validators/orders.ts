import { z } from "zod/v4";

/** Valid order statuses */
export const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

/** Address schema for shipping/billing */
export const addressSchema = z.object({
  street: z.string().min(1, "Via/indirizzo è obbligatorio"),
  city: z.string().min(1, "Città è obbligatoria"),
  zip: z.string().min(1, "CAP è obbligatorio"),
  province: z.string().nullish(),
  country: z.string().min(1, "Paese è obbligatorio").refine(
    (val) => val.toUpperCase() === "IT",
    "Le spedizioni sono disponibili solo in Italia"
  ),
});

/**
 * Zod schema for order creation.
 */
export const orderSchema = z.object({
  email: z.email("Email non valida"),
  shipping_address: addressSchema,
  billing_address: addressSchema.nullish(),
  notes: z.string().max(1000, "Note troppo lunghe").nullish(),
});

/**
 * Zod schema for order item.
 */
export const orderItemSchema = z.object({
  product_id: z.uuid("ID prodotto non valido"),
  variant_id: z.uuid("ID variante non valido").nullish(),
  product_name: z.string().min(1, "Nome prodotto è obbligatorio"),
  variant_name: z.string().nullish(),
  quantity: z
    .number()
    .int("La quantità deve essere un intero")
    .positive("La quantità deve essere > 0"),
  unit_price: z.number().nonnegative("Il prezzo unitario deve essere >= 0"),
  total_price: z.number().nonnegative("Il prezzo totale deve essere >= 0"),
});

export type OrderStatus = z.infer<typeof orderStatusEnum>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
