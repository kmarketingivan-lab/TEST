"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { nanoid } from "nanoid";

interface CouponData {
  id?: string;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  min_order_amount?: number | null;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

interface CouponFormProps {
  coupon?: CouponData;
  action: (formData: FormData) => Promise<{ success: boolean } | { error: string }>;
}

function CouponForm({ coupon, action }: CouponFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(coupon?.code ?? "");

  const generateCode = useCallback(() => {
    setCode(nanoid(8).toUpperCase());
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      formData.set("code", code);
      const result = await action(formData);
      setLoading(false);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", coupon ? "Coupon aggiornato" : "Coupon creato");
        router.push("/admin/coupons");
      }
    },
    [action, code, addToast, router, coupon]
  );

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-xl space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Codice"
            name="code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
        <Button type="button" variant="secondary" onClick={generateCode} size="sm">
          Genera
        </Button>
      </div>
      <Select
        label="Tipo sconto"
        name="discount_type"
        options={[
          { label: "Percentuale", value: "percentage" },
          { label: "Importo fisso", value: "fixed" },
        ]}
        defaultValue={coupon?.discount_type ?? "percentage"}
      />
      <Input
        label="Valore sconto"
        name="discount_value"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={coupon?.discount_value?.toString() ?? ""}
      />
      <Input
        label="Ordine minimo (€)"
        name="min_order_amount"
        type="number"
        step="0.01"
        min="0"
        defaultValue={coupon?.min_order_amount?.toString() ?? ""}
      />
      <Input
        label="Utilizzi massimi"
        name="max_uses"
        type="number"
        min="0"
        defaultValue={coupon?.max_uses?.toString() ?? ""}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="starts_at" className="text-sm font-medium text-gray-700">Data inizio</label>
        <input
          id="starts_at"
          name="starts_at"
          type="date"
          defaultValue={coupon?.starts_at?.slice(0, 10) ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="expires_at" className="text-sm font-medium text-gray-700">Data scadenza</label>
        <input
          id="expires_at"
          name="expires_at"
          type="date"
          defaultValue={coupon?.expires_at?.slice(0, 10) ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
      <Checkbox
        label="Attivo"
        name="is_active"
        value="true"
        defaultChecked={coupon?.is_active ?? true}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Annulla
        </Button>
        <Button type="submit" loading={loading}>
          {coupon ? "Aggiorna" : "Crea coupon"}
        </Button>
      </div>
    </form>
  );
}

export { CouponForm };
