import Link from "next/link";

/** Props for the StorefrontFooter component */
interface StorefrontFooterProps {
  /** Site name from settings */
  siteName: string;
  /** Contact email from settings */
  contactEmail: string;
  /** Contact phone from settings */
  contactPhone: string;
}

/**
 * Public storefront footer with contact info, useful links, and copyright.
 */
function StorefrontFooter({ siteName, contactEmail, contactPhone }: StorefrontFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{siteName}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {contactEmail && <p>Email: {contactEmail}</p>}
              {contactPhone && <p>Tel: {contactPhone}</p>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Link utili</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Catalogo</Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">Prenotazioni</Link>
              <Link href="/account" className="text-gray-600 hover:text-gray-900">Il mio account</Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Informazioni</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">Termini e Condizioni</Link>
              <Link href="/contatti" className="text-gray-600 hover:text-gray-900">Contatti</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          &copy; {currentYear} {siteName}. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}

export { StorefrontFooter };
export type { StorefrontFooterProps };
