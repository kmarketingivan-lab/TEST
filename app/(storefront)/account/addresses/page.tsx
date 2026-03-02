import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types/database";
import { AddressList } from "./address-list";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const addresses = (data ?? []) as Address[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Indirizzi</h1>
      <p className="mt-1 text-sm text-gray-600">
        Gestisci i tuoi indirizzi di spedizione (max 5)
      </p>
      <div className="mt-6">
        <AddressList addresses={addresses} />
      </div>
    </div>
  );
}
