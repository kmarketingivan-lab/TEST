"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  province: string | null;
  country: string;
}

interface AddressSelectorProps {
  savedAddresses?: SavedAddress[] | undefined;
  prefix: string;
  title: string;
  required?: boolean | undefined;
  defaultValues?: {
    street?: string;
    city?: string;
    zip?: string;
    province?: string;
    country?: string;
  } | undefined;
}

/**
 * Address form with optional dropdown for saved addresses.
 * If user has saved addresses, shows a dropdown + "Usa nuovo indirizzo".
 * Otherwise shows inline form.
 */
function AddressSelector({
  savedAddresses = [],
  prefix,
  title,
  required = true,
  defaultValues,
}: AddressSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("new");
  const [saveAddress, setSaveAddress] = useState(false);

  const hasSaved = savedAddresses.length > 0;
  const selected = hasSaved ? savedAddresses.find((a) => a.id === selectedId) : null;
  const showForm = !hasSaved || selectedId === "new";

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>

      {hasSaved && (
        <div className="mb-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-700"
          >
            {savedAddresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.label} — {addr.street}, {addr.city}
              </option>
            ))}
            <option value="new">Usa nuovo indirizzo</option>
          </select>
        </div>
      )}

      {selected && !showForm && (
        <>
          <input type="hidden" name={`${prefix}_street`} value={selected.street} />
          <input type="hidden" name={`${prefix}_city`} value={selected.city} />
          <input type="hidden" name={`${prefix}_zip`} value={selected.zip} />
          <input type="hidden" name={`${prefix}_province`} value={selected.province ?? ""} />
          <input type="hidden" name={`${prefix}_country`} value={selected.country} />
          <div className="text-sm text-gray-600">
            <p>{selected.street}</p>
            <p>{selected.zip} {selected.city} {selected.province ? `(${selected.province})` : ""}</p>
            <p>{selected.country}</p>
          </div>
        </>
      )}

      {showForm && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Via"
              name={`${prefix}_street`}
              required={required}
              defaultValue={defaultValues?.street}
            />
          </div>
          <Input
            label="Città"
            name={`${prefix}_city`}
            required={required}
            defaultValue={defaultValues?.city}
          />
          <Input
            label="CAP"
            name={`${prefix}_zip`}
            required={required}
            defaultValue={defaultValues?.zip}
          />
          <Input
            label="Provincia"
            name={`${prefix}_province`}
            defaultValue={defaultValues?.province}
          />
          <Input
            label="Paese"
            name={`${prefix}_country`}
            required={required}
            defaultValue={defaultValues?.country ?? "IT"}
          />
          {hasSaved && (
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id={`${prefix}_save`}
                name={`${prefix}_save`}
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-500"
              />
              <label htmlFor={`${prefix}_save`} className="text-sm text-gray-600">
                Salva questo indirizzo per il futuro
              </label>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export { AddressSelector };
export type { SavedAddress };
