"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AddressForm } from "@/components/storefront/address-form";
import type { Address } from "@/types/database";

function AddressList({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo indirizzo?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "Indirizzo eliminato");
      router.refresh();
    } else {
      addToast("error", "Errore nell'eliminazione");
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    const res = await fetch(`/api/account/addresses/${id}/default`, { method: "PUT" });
    if (res.ok) {
      addToast("success", "Indirizzo predefinito aggiornato");
      router.refresh();
    } else {
      addToast("error", "Errore nell'aggiornamento");
    }
    setSettingDefaultId(null);
  };

  return (
    <>
      {addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-lg border bg-white p-4 ${
                addr.is_default ? "border-red-300 ring-1 ring-red-100" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                  {addr.is_default && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>{addr.full_name}</p>
                <p>{addr.street}</p>
                <p>
                  {addr.postal_code} {addr.city} ({addr.province})
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="mt-1">{addr.phone}</p>}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditAddress(addr);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                  Modifica
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(addr.id)}
                  loading={deletingId === addr.id}
                >
                  <Trash2 className="h-3 w-3" />
                  Elimina
                </Button>
                {!addr.is_default && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetDefault(addr.id)}
                    loading={settingDefaultId === addr.id}
                  >
                    <Star className="h-3 w-3" />
                    Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16">
          <MapPin className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-600">Nessun indirizzo salvato</p>
        </div>
      )}

      {addresses.length < 5 && (
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => {
              setEditAddress(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Aggiungi indirizzo
          </Button>
        </div>
      )}

      <AddressForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditAddress(null);
        }}
        address={editAddress}
      />
    </>
  );
}

export { AddressList };
