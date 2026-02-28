"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils/slugify";
import type { Product, Category } from "@/types/database";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

/**
 * Shared product form for create and edit pages.
 */
function ProductForm({ product, categories, action }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [richDescription, setRichDescription] = useState(product?.rich_description ?? "");
  const [slugValue, setSlugValue] = useState(product?.slug ?? "");
  const [nameValue, setNameValue] = useState(product?.name ?? "");

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
    if (!product) {
      setSlugValue(slugify(e.target.value));
    }
  }, [product]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rich_description", richDescription);
    formData.set("slug", slugValue);
    const result = await action(formData);
    setLoading(false);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", product ? "Prodotto aggiornato" : "Prodotto creato");
      router.push("/admin/products");
    }
  }, [action, richDescription, slugValue, addToast, router, product]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
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
            description="URL-friendly identifier"
          />
          <Textarea
            label="Descrizione"
            name="description"
            defaultValue={product?.description ?? ""}
            showCount
            maxLength={500}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrizione ricca</label>
            <RichTextEditor
              value={richDescription}
              onChange={setRichDescription}
              placeholder="Scrivi una descrizione dettagliata..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prezzo (€)"
              name="price"
              type="number"
              required
              step="0.01"
              min="0"
              defaultValue={product?.price.toFixed(2)}
            />
            <Input
              label="Prezzo precedente (€)"
              name="compare_at_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.compare_at_price?.toFixed(2) ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Costo (€)"
              name="cost_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.cost_price?.toFixed(2) ?? ""}
            />
            <Input
              label="Stock"
              name="stock_quantity"
              type="number"
              min="0"
              defaultValue={String(product?.stock_quantity ?? 0)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              name="sku"
              defaultValue={product?.sku ?? ""}
            />
            <Input
              label="Barcode"
              name="barcode"
              defaultValue={product?.barcode ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Soglia stock basso"
              name="low_stock_threshold"
              type="number"
              min="0"
              defaultValue={String(product?.low_stock_threshold ?? 5)}
            />
            <Input
              label="Peso (grammi)"
              name="weight_grams"
              type="number"
              min="0"
              defaultValue={product?.weight_grams?.toString() ?? ""}
            />
          </div>
          <Select
            label="Categoria"
            name="category_id"
            options={categoryOptions}
            placeholder="Seleziona categoria"
            defaultValue={product?.category_id ?? ""}
          />
          <div className="flex gap-6">
            <Checkbox
              label="Attivo"
              name="is_active"
              value="true"
              defaultChecked={product?.is_active ?? true}
            />
            <Checkbox
              label="In evidenza"
              name="is_featured"
              value="true"
              defaultChecked={product?.is_featured ?? false}
            />
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">SEO</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Titolo SEO"
            name="seo_title"
            defaultValue={product?.seo_title ?? ""}
          />
          <Textarea
            label="Descrizione SEO"
            name="seo_description"
            defaultValue={product?.seo_description ?? ""}
            maxLength={160}
            showCount
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {product ? "Aggiorna" : "Crea prodotto"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
export type { ProductFormProps };
