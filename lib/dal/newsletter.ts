import { createClient } from "@/lib/supabase/server";
import type { NewsletterSubscriber } from "@/types/database";

interface PaginatedSubscribers {
  data: NewsletterSubscriber[];
  count: number;
}

/**
 * Subscribe an email to the newsletter.
 */
export async function subscribe(
  email: string,
  fullName?: string
): Promise<NewsletterSubscriber> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        full_name: fullName ?? null,
        is_active: true,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as NewsletterSubscriber;
}

/**
 * Unsubscribe an email from the newsletter.
 */
export async function unsubscribe(email: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim());

  if (error) throw error;
}

/**
 * Get newsletter subscribers with pagination (admin).
 */
export async function getSubscribers(
  options: { page?: number; perPage?: number } = {}
): Promise<PaginatedSubscribers> {
  const { page = 1, perPage = 50 } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as NewsletterSubscriber[],
    count: count ?? 0,
  };
}
