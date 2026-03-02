import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { NewsletterList } from "./newsletter-list";

export default async function AdminNewsletterPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const subs = (subscribers ?? []) as SubscriberRow[];
  const activeCount = subs.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500">
            {activeCount} iscritti attivi su {subs.length} totali
          </p>
        </div>
      </div>
      <NewsletterList subscribers={subs} />
    </div>
  );
}

interface SubscriberRow {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  subscribed_at: string;
  [key: string]: unknown;
}
