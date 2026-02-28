"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils/slugify";
import type { Category } from "@/types/database";

interface CategoryFormProps {
  category?: Category;
  parentOptions: Array<{ label: string; value: string }>;
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

function CategoryForm({ category, parentOptions, action }: CategoryFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slugValue, setSlugValue] = useState(category?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("slug", slugValue);
    formData.set("image_url", imageUrl);
    const result = await action(formData);
    setLoading(false);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", category ? "Categoria aggiornata" : "Categoria creata");
      router.push("/admin/categories");
    }
  }, [action, slugValue, imageUrl, addToast, router, category]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-4">
      <Input
        label="Nome"
        name="name"
        required
        defaultValue={category?.name ?? ""}
        onChange={(e) => { if (!category) setSlugValue(slugify(e.target.value)); }}
      />
      <Input
        label="Slug"
        name="slug"
        required
        value={slugValue}
        onChange={(e) => setSlugValue(e.target.value)}
      />
      <Textarea
        label="Descrizione"
        name="description"
        defaultValue={category?.description ?? ""}
      />
      <Select
        label="Categoria padre"
        name="parent_id"
        options={parentOptions}
        placeholder="Nessuna (livello principale)"
        defaultValue={category?.parent_id ?? ""}
      />
      <Input
        label="Ordinamento"
        name="sort_order"
        type="number"
        defaultValue={String(category?.sort_order ?? 0)}
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Immagine</label>
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onClear={() => setImageUrl("")}
          folder="categories"
        />
      </div>
      <Checkbox
        label="Attiva"
        name="is_active"
        value="true"
        defaultChecked={category?.is_active ?? true}
      />
      <div className="flex gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {category ? "Aggiorna" : "Crea"}
        </Button>
      </div>
    </form>
  );
}

export { CategoryForm };
