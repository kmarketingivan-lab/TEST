import { z } from "zod/v4";

/** Valid user roles */
export const roleEnum = z.enum(["admin", "customer"]);

/** Phone number regex — optional Italian/international format */
const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Zod schema for profile validation.
 * Used to validate profile updates from client.
 */
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(100, "Il nome non può superare 100 caratteri"),
  phone: z
    .string()
    .regex(phoneRegex, "Numero di telefono non valido")
    .nullish(),
  avatar_url: z.url("URL avatar non valido").nullish(),
});

/**
 * Schema for admin profile update — includes role.
 */
export const adminProfileUpdateSchema = profileSchema.extend({
  role: roleEnum,
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Inserisci la password attuale"),
    new_password: z.string().min(8, "La nuova password deve avere almeno 8 caratteri"),
    confirm_password: z.string().min(1, "Conferma la nuova password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Le password non coincidono",
    path: ["confirm_password"],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
