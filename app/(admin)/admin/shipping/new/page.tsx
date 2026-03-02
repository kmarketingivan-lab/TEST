import { requireAdmin } from "@/lib/auth/helpers";
import { ShippingForm } from "../shipping-form";
import { createShippingZone } from "../actions";

export default async function NewShippingZonePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuova zona di spedizione</h1>
      <ShippingForm action={createShippingZone} />
    </div>
  );
}
