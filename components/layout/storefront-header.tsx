"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Category } from "@/types/database";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchModal } from "@/components/layout/search-modal";

interface StorefrontHeaderProps {
  cartCount: number;
  isLoggedIn: boolean;
  categories?: (Category & { children: Category[] })[];
}

interface NavLink {
  label: string;
  href: string;
}

const simpleNavLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Prenotazioni", href: "/bookings" },
  { label: "Contatti", href: "/contatti" },
];

function StorefrontHeader({ cartCount, isLoggedIn, categories = [] }: StorefrontHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-white">
          My Ecommerce
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/") ? "text-red-500 font-semibold" : "text-neutral-300 hover:text-white"
            }`}
          >
            Home
          </Link>

          {/* Mega menu for Catalogo */}
          <MegaMenu categories={categories} />

          {simpleNavLinks
            .filter((l) => l.href !== "/")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href) ? "text-red-500 font-semibold" : "text-neutral-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Icon group: Search | Cart | Account */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <SearchModal />

          {/* Cart */}
          <Link href="/cart" className="relative flex items-center text-neutral-300 hover:text-white">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Account / Login */}
          <Link
            href={isLoggedIn ? "/account" : "/auth/login"}
            className="flex items-center gap-1 text-sm text-neutral-300 hover:text-white"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{isLoggedIn ? "Account" : "Accedi"}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-1 text-neutral-300 hover:text-white md:hidden"
            aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav className="border-t border-neutral-800 bg-neutral-900 px-4 py-3 md:hidden">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive("/") ? "bg-red-900/30 text-red-400" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Home
          </Link>

          {/* Categories accordion */}
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
          >
            <span>Catalogo</span>
            {catOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {catOpen && (
            <div className="ml-4 space-y-1">
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                Tutti i prodotti
              </Link>
              {categories
                .filter((c) => c.is_active)
                .map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-1.5 text-sm font-medium text-yellow-500 hover:bg-neutral-800"
                    >
                      {cat.name}
                    </Link>
                    {cat.children
                      .filter((c) => c.is_active)
                      .map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?category=${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-3 py-1.5 pl-6 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        >
                          {child.name}
                        </Link>
                      ))}
                  </div>
                ))}
            </div>
          )}

          {simpleNavLinks
            .filter((l) => l.href !== "/")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-red-900/30 text-red-400" : "text-neutral-300 hover:bg-neutral-800"
                }`}
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
