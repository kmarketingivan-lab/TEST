"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { setPickupDocumentVerified } from "../actions";

const DOC_LABELS: Record<string, string> = {
  porto_armi: "Porto d'armi",
  nulla_osta_questore: "Nulla osta Questore",
  carta_collezionista: "Carta collezionista",
  licenza_commerciale: "Licenza commerciale",
};

interface PickupInfoProps {
  orderId: string;
  pickupDocumentType: string | null;
  pickupDocumentNumber: string | null;
  pickupDocumentVerified: boolean;
}

function PickupInfo({ orderId, pickupDocumentType, pickupDocumentNumber, pickupDocumentVerified }: PickupInfoProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [verified, setVerified] = useState(pickupDocumentVerified);
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setLoading(true);
    const result = await setPickupDocumentVerified(orderId, newValue);
    setLoading(false);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      setVerified(newValue);
      addToast("success", newValue ? "Documento verificato" : "Verifica rimossa");
      router.refresh();
    }
  }, [orderId, addToast, router]);

  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-sm font-semibold text-white">
          RITIRO IN NEGOZIO
        </span>
        {verified && (
          <span className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white">
            ✓ Documento verificato
          </span>
        )}
      </div>
      <dl className="space-y-2 text-sm">
        {pickupDocumentType && (
          <div>
            <dt className="text-gray-500">Tipo documento:</dt>
            <dd className="font-medium text-gray-900">{DOC_LABELS[pickupDocumentType] ?? pickupDocumentType}</dd>
          </div>
        )}
        {pickupDocumentNumber && (
          <div>
            <dt className="text-gray-500">Numero documento:</dt>
            <dd className="font-medium text-gray-900">{pickupDocumentNumber}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => void handleVerify(e)}
            disabled={loading}
            className="h-4 w-4 rounded border-gray-300 accent-red-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Documento verificato fisicamente dal personale
          </span>
        </label>
      </div>
    </div>
  );
}

export { PickupInfo };
