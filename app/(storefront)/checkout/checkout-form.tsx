"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createOrder } from "@/lib/checkout/actions";
import { AddressSelector } from "@/components/storefront/address-selector";
import type { SavedAddress } from "@/components/storefront/address-selector";
import { CouponForm } from "@/components/storefront/coupon-form";

interface CheckoutFormProps {
  userEmail: string;
  userName?: string;
  savedAddresses?: SavedAddress[];
  isLoggedIn?: boolean;
}

/**
 * Checkout form with AddressSelector, CouponForm, guest checkout, and notes.
 */
function CheckoutForm({ userEmail, userName, savedAddresses, isLoggedIn }: CheckoutFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);

  const handleCouponApply = useCallback((code: string, label: string) => {
    setCouponCode(code);
    setCouponLabel(label);
  }, []);

  const handleCouponRemove = useCallback(() => {
    setCouponCode(null);
    setCouponLabel(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Attach coupon code if any
    if (couponCode) {
      formData.set("coupon_code", couponCode);
    }

    // If billing = shipping, remove billing fields so server action skips them
    if (sameBilling) {
      formData.delete("billing_street");
      formData.delete("billing_city");
      formData.delete("billing_zip");
      formData.delete("billing_province");
      formData.delete("billing_country");
    }

    const result = await createOrder(formData);
    setLoading(false);

    if ("error" in result) {
      addToast("error", result.error);
    } else {
      router.push(`/checkout/success?order=${result.orderNumber}`);
    }
  }, [addToast, router, sameBilling, couponCode]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {/* Customer info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Dati cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            name="customer_name"
            required
            defaultValue={userName ?? ""}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={userEmail}
          />
          <Input label="Telefono" name="customer_phone" type="tel" />
        </div>
        {!isLoggedIn && (
          <p className="mt-3 text-xs text-gray-500">
            Puoi completare l&apos;ordine senza creare un account.
          </p>
        )}
      </section>

      {/* Shipping address */}
      <AddressSelector
        savedAddresses={savedAddresses}
        prefix="shipping"
        title="Indirizzo di spedizione"
        required
      />

      {/* Billing address toggle */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <Checkbox
          label="Indirizzo di fatturazione uguale a spedizione"
          name="same_billing"
          value="true"
          defaultChecked={true}
          onChange={(e) => setSameBilling(e.target.checked)}
        />

        {!sameBilling && (
          <div className="mt-4">
            <AddressSelector
              savedAddresses={savedAddresses}
              prefix="billing"
              title="Indirizzo di fatturazione"
              required
            />
          </div>
        )}
      </section>

      {/* Coupon */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Codice sconto</h2>
        <CouponForm
          onApply={handleCouponApply}
          onRemove={handleCouponRemove}
          appliedCode={couponCode}
          appliedLabel={couponLabel}
        />
      </section>

      {/* Notes */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <Textarea label="Note ordine (opzionale)" name="notes" placeholder="Istruzioni speciali per la consegna..." />
      </section>

      <Button type="submit" loading={loading} className="w-full">
        Conferma ordine
      </Button>
    </form>
  );
}

export { CheckoutForm };
