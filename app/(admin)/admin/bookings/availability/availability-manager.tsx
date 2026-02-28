"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateAvailability } from "../actions";
import type { BookingAvailability } from "@/types/database";

interface AvailabilityManagerProps {
  availability: BookingAvailability[];
  dayNames: string[];
}

function AvailabilityManager({ availability, dayNames }: AvailabilityManagerProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const getForDay = (day: number) => availability.find((a) => a.day_of_week === day);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    let hasError = false;
    for (let day = 0; day < 7; day++) {
      const isActive = formData.get(`active_${day}`) === "true";
      const startTime = String(formData.get(`start_${day}`) ?? "09:00");
      const endTime = String(formData.get(`end_${day}`) ?? "18:00");
      const existing = getForDay(day);

      const availData: Parameters<typeof updateAvailability>[0] = {
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      };
      if (existing?.id) {
        availData.id = existing.id;
      }

      const result = await updateAvailability(availData);

      if ("error" in result) {
        addToast("error", result.error);
        hasError = true;
        break;
      }
    }

    setLoading(false);
    if (!hasError) {
      addToast("success", "Disponibilità aggiornata");
      router.refresh();
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        {dayNames.map((name, day) => {
          const existing = getForDay(day);
          return (
            <div key={day} className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
              <span className="w-24 text-sm font-medium text-gray-900">{name}</span>
              <Checkbox label="Attivo" name={`active_${day}`} value="true" defaultChecked={existing?.is_active ?? false} />
              <Input label="" name={`start_${day}`} type="text" defaultValue={existing?.start_time ?? "09:00"} placeholder="09:00" className="w-24" />
              <span className="text-gray-400">—</span>
              <Input label="" name={`end_${day}`} type="text" defaultValue={existing?.end_time ?? "18:00"} placeholder="18:00" className="w-24" />
            </div>
          );
        })}
      </div>
      <Button type="submit" loading={loading}>Salva disponibilità</Button>
    </form>
  );
}

export { AvailabilityManager };
