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
import { X, Plus } from "lucide-react";
import type { Product, Category } from "@/types/database";

interface Brand {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: Product & {
    specifications?: Record<string, string> | null;
    regulatory_info?: string | null;
    brand_id?: string | null;
  };
  categories: Category[];
  brands?: Brand[];
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

const suggestedSpecs = [
  "Calibro",
  "Lunghezza canna",
  "Peso",
  "Capacità",
  "Tipo azione",
  "Materiale",
];

/**
 * Shared product form for create and edit pages.
 */
function ProductForm({ product, categories, brands = [], action }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [richDescription, setRichDescription] = useState(product?.rich_description ?? "");
  const [slugValue, setSlugValue] = useState(product?.slug ?? "");
  const [nameValue, setNameValue] = useState(product?.name ?? "");

  // H12: Specifications state
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    const existingSpecs = product?.specifications;
    if (existingSpecs && typeof existingSpecs === "object") {
      return Object.entries(existingSpecs).map(([key, value]) => ({ key, value: String(value) }));
    }
    return [];
  });

  // H12: Regulatory info
  const [regulatoryInfo, setRegulatoryInfo] = useState(product?.regulatory_info ?? "");

  // H12: Brand
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");

  // Compliance: product type
  const [productType, setProductType] = useState(product?.product_type ?? "standard");

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const brandOptions = brands.map((b) => ({ label: b.name, value: b.id }));

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
    if (!product) {
      setSlugValue(slugify(e.target.value));
    }
  }, [product]);

  const addSpec = useCallback((key = "") => {
    setSpecs((prev) => [...prev, { key, value: "" }]);
  }, []);

  const removeSpec = useCallback((index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSpec = useCallback((index: number, field: "key" | "value", val: string) => {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rich_description", richDescription);
    formData.set("slug", slugValue);

    // H12: Add specifications as JSON
    const specsObj: Record<string, string> = {};
    for (const spec of specs) {
      if (spec.key.trim()) {
        specsObj[spec.key.trim()] = spec.value;
      }
    }
    formData.set("specifications", JSON.stringify(specsObj));

    // H12: Add regulatory_info and brand_id
    formData.set("regulatory_info", regulatoryInfo);
    formData.set("brand_id", brandId);
    formData.set("product_type", productType);

    const result = await action(formData);
    setLoading(false);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", product ? "Prodotto aggiornato" : "Prodotto creato");
      router.push("/admin/products");
    }
  }, [action, richDescription, slugValue, specs, regulatoryInfo, brandId, addToast, router, product]);

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
          {/* Compliance: product type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipo prodotto (normativa)</label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="standard">Standard</option>
              <option value="arma_fuoco">Arma da fuoco</option>
              <option value="munizioni">Munizioni</option>
              <option value="fuochi_artificiali">Fuochi artificiali</option>
              <option value="accessori">Accessori</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Arma da fuoco e Munizioni → ritiro obbligatorio in negozio. Fuochi artificiali → spedizione ADR.
            </p>
          </div>

          {/* H12: Brand select */}
          {brandOptions.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Marca</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Nessuna marca</option>
                {brandOptions.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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

      {/* H12: Specifications Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Specifiche tecniche</h3>
        <div className="space-y-3">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                label=""
                placeholder="Chiave"
                value={spec.key}
                onChange={(e) => updateSpec(index, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                label=""
                placeholder="Valore"
                value={spec.value}
                onChange={(e) => updateSpec(index, "value", e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                aria-label="Rimuovi specifica"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => addSpec()}>
              <Plus className="h-4 w-4" /> Aggiungi specifica
            </Button>
            {suggestedSpecs
              .filter((s) => !specs.some((sp) => sp.key === s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSpec(s)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* H12: Regulatory info */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Info normativa</h3>
        <textarea
          value={regulatoryInfo}
          onChange={(e) => setRegulatoryInfo(e.target.value)}
          placeholder="Informazioni normative, avvertenze, classificazioni..."
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
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
