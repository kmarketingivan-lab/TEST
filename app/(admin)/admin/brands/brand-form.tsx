"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils/slugify";

interface BrandData {
  id?: string;
  name?: string;
  slug?: string;
  logo_url?: string | null;
  website?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

interface BrandFormProps {
  brand?: BrandData;
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

function BrandForm({ brand, action }: BrandFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nameValue, setNameValue] = useState(brand?.name ?? "");
  const [slugValue, setSlugValue] = useState(brand?.slug ?? "");

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNameValue(e.target.value);
      if (!brand?.id) setSlugValue(slugify(e.target.value));
    },
    [brand]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      formData.set("slug", slugValue);
      const result = await action(formData);
      setLoading(false);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", brand ? "Marchio aggiornato" : "Marchio creato");
        router.push("/admin/brands");
      }
    },
    [action, slugValue, addToast, router, brand]
  );

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-4">
      <Input
        label="Nome"
        name="name"
        required
        value={nameValue}
        onChange={handleNameChange}
      />
      <Input
        label="Slug"
        name="slug"
        required
        value={slugValue}
        onChange={(e) => setSlugValue(e.target.value)}
      />
      <Input
        label="URL Logo"
        name="logo_url"
        defaultValue={brand?.logo_url ?? ""}
      />
      <Input
        label="Sito web"
        name="website"
        type="url"
        defaultValue={brand?.website ?? ""}
      />
      <Input
        label="Ordine"
        name="sort_order"
        type="number"
        min="0"
        defaultValue={String(brand?.sort_order ?? 0)}
      />
      <Checkbox
        label="Attivo"
        name="is_active"
        value="true"
        defaultChecked={brand?.is_active ?? true}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {brand ? "Aggiorna" : "Crea marchio"}
        </Button>
      </div>
    </form>
  );
}

export { BrandForm };
