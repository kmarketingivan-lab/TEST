import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { BrandForm } from "../../brand-form";
import { updateBrand } from "../../actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (!brand) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateBrand(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica marchio</h1>
      <BrandForm brand={brand as Record<string, unknown>} action={handleUpdate} />
    </div>
  );
}
