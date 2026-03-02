"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ShippingData {
  id?: string;
  name?: string;
  countries?: string[];
  flat_rate?: number;
  min_order_free_shipping?: number | null;
  per_kg_rate?: number | null;
  is_active?: boolean;
}

interface ShippingFormProps {
  zone?: ShippingData;
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

function ShippingForm({ zone, action }: ShippingFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const result = await action(formData);
      setLoading(false);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", zone ? "Zona aggiornata" : "Zona creata");
        router.push("/admin/shipping");
      }
    },
    [action, addToast, router, zone]
  );

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-4">
      <Input label="Nome" name="name" required defaultValue={zone?.name ?? ""} />
      <Input
        label="Paesi (separati da virgola)"
        name="countries"
        defaultValue={zone?.countries?.join(", ") ?? ""}
        description="Es: IT, DE, FR"
      />
      <Input
        label="Tariffa fissa (€)"
        name="flat_rate"
        type="number"
        step="0.01"
        min="0"
        defaultValue={zone?.flat_rate?.toString() ?? "0"}
      />
      <Input
        label="Gratis per ordini sopra (€)"
        name="min_order_free_shipping"
        type="number"
        step="0.01"
        min="0"
        defaultValue={zone?.min_order_free_shipping?.toString() ?? ""}
      />
      <Input
        label="Tariffa per kg (€)"
        name="per_kg_rate"
        type="number"
        step="0.01"
        min="0"
        defaultValue={zone?.per_kg_rate?.toString() ?? ""}
      />
      <Checkbox
        label="Attiva"
        name="is_active"
        value="true"
        defaultChecked={zone?.is_active ?? true}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {zone ? "Aggiorna" : "Crea zona"}
        </Button>
      </div>
    </form>
  );
}

export { ShippingForm };
