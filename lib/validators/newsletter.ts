import { z } from "zod/v4";

export const newsletterSubscribeSchema = z.object({
  email: z.email("Email non valida"),
  full_name: z.string().max(100, "Il nome non può superare 100 caratteri").nullish(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
