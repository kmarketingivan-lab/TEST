"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { Address } from "@/types/database";

interface AddressFormProps {
  address?: Address | null;
  open: boolean;
  onClose: () => void;
}

function AddressForm({ address, open, onClose }: AddressFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState(address?.label ?? "");
  const [fullName, setFullName] = useState(address?.full_name ?? "");
  const [phone, setPhone] = useState(address?.phone ?? "");
  const [street, setStreet] = useState(address?.street ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [province, setProvince] = useState(address?.province ?? "");
  const [postalCode, setPostalCode] = useState(address?.postal_code ?? "");
  const [country, setCountry] = useState(address?.country ?? "Italia");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body = { label, full_name: fullName, phone: phone || null, street, city, province, postal_code: postalCode, country };

    const url = address
      ? `/api/account/addresses/${address.id}`
      : "/api/account/addresses";
    const method = address ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      addToast("success", address ? "Indirizzo aggiornato" : "Indirizzo aggiunto");
      router.refresh();
      onClose();
    } else {
      const data = await res.json().catch(() => ({}));
      addToast("error", (data as { error?: string }).error ?? "Errore nel salvataggio");
    }
    setSaving(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={address ? "Modifica indirizzo" : "Aggiungi indirizzo"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="address-form" loading={saving}>
            Salva
          </Button>
        </>
      }
    >
      <form id="address-form" onSubmit={handleSubmit} className="space-y-3">
        <Input label="Etichetta" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="es. Casa, Ufficio" />
        <Input label="Nome completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Telefono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Indirizzo" required value={street} onChange={(e) => setStreet(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Città" required value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="Provincia" required value={province} onChange={(e) => setProvince(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="CAP" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          <Input label="Paese" required value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}

export { AddressForm };
