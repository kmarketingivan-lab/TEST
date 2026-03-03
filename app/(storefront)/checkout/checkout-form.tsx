"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AddressSelector } from "@/components/storefront/address-selector";
import type { SavedAddress } from "@/components/storefront/address-selector";
import { CouponForm } from "@/components/storefront/coupon-form";

interface CheckoutFormProps {
  userEmail: string;
  userName?: string;
  savedAddresses?: SavedAddress[];
  isLoggedIn?: boolean;
  hasFirearms?: boolean;
  hasPyrotechnics?: boolean;
}

/**
 * Checkout form — collects customer data and redirects to Stripe.
 * The actual order is created by the Stripe webhook after payment confirmation.
 */
function CheckoutForm({ userEmail, userName, savedAddresses, isLoggedIn, hasFirearms = false, hasPyrotechnics = false }: CheckoutFormProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [pickupDocConfirmed, setPickupDocConfirmed] = useState(false);

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

    // Build address objects from form fields
    const shippingAddress = {
      street: (formData.get("shipping_street") as string) || "",
      city: (formData.get("shipping_city") as string) || "",
      zip: (formData.get("shipping_zip") as string) || "",
      province: (formData.get("shipping_province") as string) || null,
      country: (formData.get("shipping_country") as string) || "IT",
    };

    const billingAddress = sameBilling ? shippingAddress : {
      street: (formData.get("billing_street") as string) || "",
      city: (formData.get("billing_city") as string) || "",
      zip: (formData.get("billing_zip") as string) || "",
      province: (formData.get("billing_province") as string) || null,
      country: (formData.get("billing_country") as string) || "IT",
    };

    const body = {
      email: formData.get("email") as string,
      customer_name: formData.get("customer_name") as string,
      customer_phone: (formData.get("customer_phone") as string) || null,
      notes: (formData.get("notes") as string) || null,
      coupon_code: couponCode,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      requires_pickup: hasFirearms,
      pickup_document_type: (formData.get("pickup_document_type") as string) || null,
      pickup_document_number: (formData.get("pickup_document_number") as string) || null,
    };

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (res.status === 503) {
        addToast("info", "I pagamenti saranno disponibili a breve. Contattaci per ordinare.");
        setLoading(false);
        return;
      }

      if (!res.ok || !data.url) {
        addToast("error", data.error ?? "Errore durante il checkout");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout (don't setLoading(false) — page is leaving)
      window.location.href = data.url;
    } catch {
      addToast("error", "Errore di connessione");
      setLoading(false);
    }
  }, [addToast, sameBilling, couponCode, hasFirearms]);

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

      {/* Firearms warning */}
      {hasFirearms && (
        <section className="rounded-lg border-2 border-red-800 bg-red-950 p-6 text-white">
          <h2 className="mb-2 text-lg font-bold text-red-300">⚠️ RITIRO OBBLIGATORIO IN NEGOZIO</h2>
          <p className="text-sm leading-relaxed">
            Gli articoli nel tuo carrello includono armi da fuoco e/o munizioni. Per legge (Art. 17, L. 110/1975),
            il ritiro deve avvenire fisicamente presso{" "}
            <strong>Armeria Palmetto — Via Oberdan 70, 25121 Brescia</strong>, previa esibizione del documento
            abilitativo (porto d&apos;armi o nulla osta del Questore). Non è possibile ricevere spedizioni a domicilio.
          </p>
          {/* Hidden store address used to build shipping_address object */}
          <input type="hidden" name="shipping_street" value="Via Oberdan 70" />
          <input type="hidden" name="shipping_city" value="Brescia" />
          <input type="hidden" name="shipping_zip" value="25121" />
          <input type="hidden" name="shipping_province" value="BS" />
          <input type="hidden" name="shipping_country" value="IT" />
        </section>
      )}

      {/* Pyrotechnics info */}
      {hasPyrotechnics && (
        <section className="rounded-lg border-2 border-yellow-500 bg-yellow-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-yellow-800">ℹ️ SPEDIZIONE FUOCHI ARTIFICIALI</h2>
          <p className="text-sm leading-relaxed text-yellow-900">
            Gli articoli pirotecnici vengono spediti tramite corriere specializzato ADR. I tempi di consegna
            potrebbero essere più lunghi rispetto alla spedizione standard.
          </p>
        </section>
      )}

      {/* Shipping address — hidden for firearms-only orders */}
      {!hasFirearms && (
        <AddressSelector
          savedAddresses={savedAddresses}
          prefix="shipping"
          title="Indirizzo di spedizione"
          required
        />
      )}

      {/* Pickup document — only for firearms orders */}
      {hasFirearms && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Documento abilitativo</h2>
          <p className="mb-4 text-sm text-gray-600">
            Seleziona il tipo di documento che presenterai al ritiro e inserisci il numero.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo documento <span className="text-red-600">*</span>
              </label>
              <select
                name="pickup_document_type"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Seleziona...</option>
                <option value="porto_armi">Porto d&apos;armi</option>
                <option value="nulla_osta_questore">Nulla osta Questore</option>
                <option value="carta_collezionista">Carta collezionista</option>
                <option value="licenza_commerciale">Licenza commerciale</option>
              </select>
            </div>
            <Input
              label="Numero documento"
              name="pickup_document_number"
              required
              placeholder="es. BS 12345/2024"
            />
          </div>
          <div className="mt-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="pickup_doc_confirmed"
                required
                onChange={(e) => setPickupDocConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-600"
              />
              <span className="text-sm text-gray-700">
                Dichiaro di essere in possesso del documento selezionato e di portarlo al ritiro in armeria.
              </span>
            </label>
          </div>
        </section>
      )}

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

      <Button
        type="submit"
        loading={loading}
        disabled={hasFirearms && !pickupDocConfirmed}
        className="w-full"
      >
        Paga con Stripe
      </Button>
    </form>
  );
}

export { CheckoutForm };
