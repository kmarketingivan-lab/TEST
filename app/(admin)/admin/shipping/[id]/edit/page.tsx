import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { ShippingForm } from "../../shipping-form";
import { updateShippingZone } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditShippingZonePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: zone } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("id", id)
    .single();

  if (!zone) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateShippingZone(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica zona di spedizione</h1>
      <ShippingForm zone={zone as Record<string, unknown>} action={handleUpdate} />
    </div>
  );
}
