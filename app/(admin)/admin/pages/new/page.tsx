import { requireAdmin } from "@/lib/auth/helpers";
import { PageForm } from "../page-form";
import { createPage } from "../actions";

export default async function NewPagePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nuova pagina</h1>
      <PageForm action={createPage} />
    </div>
  );
}
