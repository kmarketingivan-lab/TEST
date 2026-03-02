import Link from "next/link";
import { MapPin, Clock, Phone as PhoneIcon, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/storefront/newsletter-form";

interface StorefrontFooterProps {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
}

function StorefrontFooter({ siteName, contactEmail, contactPhone }: StorefrontFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800 bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Store Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">
              Il nostro negozio
            </h3>
            <div className="mt-3 space-y-2 text-sm text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                <span>Via Oberdan 70, 25121 Brescia (BS)</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                <span>Lun-Sab 9:00-19:00</span>
              </div>
              {contactPhone && (
                <div className="flex items-start gap-2">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  <a href={`tel:${contactPhone}`} className="hover:text-white">
                    {contactPhone}
                  </a>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-white">
                    {contactEmail}
                  </a>
                </div>
              )}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-red-400 hover:text-red-300"
              >
                Apri in Google Maps &rarr;
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Link utili</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/products" className="text-neutral-400 hover:text-white">Catalogo</Link>
              <Link href="/blog" className="text-neutral-400 hover:text-white">Blog</Link>
              <Link href="/bookings" className="text-neutral-400 hover:text-white">Prenotazioni</Link>
              <Link href="/account" className="text-neutral-400 hover:text-white">Il mio account</Link>
            </nav>
          </div>

          {/* Col 3: Legal Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Informazioni</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/privacy-policy" className="text-neutral-400 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white">Termini e Condizioni</Link>
              <Link href="/cookie-policy" className="text-neutral-400 hover:text-white">Cookie Policy</Link>
              <Link href="/contatti" className="text-neutral-400 hover:text-white">Contatti</Link>
            </nav>
          </div>

          {/* Col 4: Newsletter + Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Newsletter</h3>
            <p className="mt-3 text-sm text-neutral-400">
              Iscriviti per ricevere offerte e novità.
            </p>
            <div className="mt-3">
              <NewsletterForm compact />
            </div>

            {/* Social Icons */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Seguici</h3>
              <div className="mt-3 flex gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-pink-600 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-green-600 hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-neutral-800 pt-6">
          {["Visa", "Mastercard", "PayPal"].map((name) => (
            <span
              key={name}
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs text-neutral-400"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Copyright + P.IVA */}
        <div className="mt-4 text-center text-xs text-neutral-500">
          <p>
            &copy; {currentYear} {siteName}. Tutti i diritti riservati.
          </p>
          <p className="mt-1">P.IVA: 00000000000 — REA: RM-000000</p>
        </div>
      </div>
    </footer>
  );
}

export { StorefrontFooter };
export type { StorefrontFooterProps };
