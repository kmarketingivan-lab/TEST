import { Phone, Mail, Clock } from "lucide-react";

interface TopBarProps {
  phone?: string | undefined;
  email?: string | undefined;
  promo?: string | undefined;
}

export function TopBar({
  phone = "+39 0123 456789",
  email = "info@myecommerce.it",
  promo = "Spedizione gratuita sopra 150\u20AC",
}: TopBarProps) {
  return (
    <div className="hidden h-8 items-center bg-neutral-950 text-xs text-neutral-400 sm:flex">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: phone + email */}
        <div className="flex items-center gap-4">
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>{phone}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>{email}</span>
          </a>
        </div>

        {/* Center: promo */}
        <div className="font-medium text-yellow-500">{promo}</div>

        {/* Right: hours */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Lun-Sab 9:00-19:00</span>
        </div>
      </div>
    </div>
  );
}
