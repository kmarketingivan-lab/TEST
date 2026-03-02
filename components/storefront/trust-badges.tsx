import { Calendar, Truck, Shield, Headphones } from "lucide-react";

const badges = [
  {
    icon: Calendar,
    label: "Dal 1985",
    description: "Esperienza e tradizione",
  },
  {
    icon: Truck,
    label: "Spedizione gratuita",
    description: "Sopra 150\u20AC",
  },
  {
    icon: Shield,
    label: "Garanzia soddisfatti",
    description: "Reso entro 30 giorni",
  },
  {
    icon: Headphones,
    label: "Assistenza specializzata",
    description: "Sempre al tuo fianco",
  },
] as const;

export function TrustBadges() {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <badge.icon className="h-8 w-8 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {badge.label}
                </p>
                <p className="text-xs text-neutral-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
