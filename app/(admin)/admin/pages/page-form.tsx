"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils/slugify";
import type { Page } from "@/types/database";

interface PageFormProps {
  page?: Page;
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

function PageForm({ page, action }: PageFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [richContent, setRichContent] = useState(page?.rich_content ?? "");
  const [slugValue, setSlugValue] = useState(page?.slug ?? "");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rich_content", richContent);
    formData.set("slug", slugValue);
    const result = await action(formData);
    setLoading(false);
    if ("error" in result) addToast("error", result.error);
    else { addToast("success", page ? "Pagina aggiornata" : "Pagina creata"); router.push("/admin/pages"); }
  }, [action, richContent, slugValue, addToast, router, page]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Input label="Titolo" name="title" required defaultValue={page?.title ?? ""}
            onChange={(e) => { if (!page) setSlugValue(slugify(e.target.value)); }} />
          <Input label="Slug" name="slug" required value={slugValue} onChange={(e) => setSlugValue(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contenuto</label>
            <RichTextEditor value={richContent} onChange={setRichContent} placeholder="Scrivi il contenuto della pagina..." />
          </div>
        </div>
        <div className="space-y-4">
          <Checkbox label="Pubblicata" name="is_published" value="true" defaultChecked={page?.is_published ?? false} />
          <h3 className="pt-4 text-lg font-semibold text-gray-900">SEO</h3>
          <Input label="Titolo SEO" name="seo_title" defaultValue={page?.seo_title ?? ""} />
          <Textarea label="Descrizione SEO" name="seo_description" defaultValue={page?.seo_description ?? ""} maxLength={160} showCount />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={() => router.back()}>Annulla</Button>
        <Button type="submit" loading={loading}>{page ? "Aggiorna" : "Crea"}</Button>
      </div>
    </form>
  );
}

export { PageForm };
