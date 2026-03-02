import { requireAdmin } from "@/lib/auth/helpers";
import { BrandForm } from "../brand-form";
import { createBrand } from "../actions";

export default async function NewBrandPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuovo marchio</h1>
      <BrandForm action={createBrand} />
    </div>
  );
}
