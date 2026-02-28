"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X } from "lucide-react";

/** Props for the StorefrontHeader component */
interface StorefrontHeaderProps {
  /** Number of items in cart */
  cartCount: number;
  /** Whether user is logged in */
  isLoggedIn: boolean;
}

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Catalogo", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Prenotazioni", href: "/bookings" },
  { label: "Contatti", href: "/contatti" },
];

/**
 * Public storefront header with navigation, cart icon with counter, and login/account link.
 */
function StorefrontHeader({ cartCount, isLoggedIn }: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-gray-900">
          My Ecommerce
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors
                ${isActive(link.href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart icon */}
          <Link href="/cart" className="relative flex items-center text-gray-600 hover:text-gray-900">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account / Login */}
          <Link
            href={isLoggedIn ? "/account" : "/auth/login"}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{isLoggedIn ? "Account" : "Accedi"}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-1 text-gray-600 hover:text-gray-900 md:hidden"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${isActive(link.href) ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export { StorefrontHeader };
export type { StorefrontHeaderProps };
