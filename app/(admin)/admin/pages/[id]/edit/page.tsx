import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { PageForm } from "../../page-form";
import { updatePage } from "../../actions";
import { notFound } from "next/navigation";
import type { Page } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("pages").select("*").eq("id", id).single();
  if (!data) notFound();
  const page = data as Page;

  async function handleUpdate(formData: FormData) {
    "use server";
    return updatePage(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica pagina</h1>
      <PageForm page={page} action={handleUpdate} />
    </div>
  );
}
