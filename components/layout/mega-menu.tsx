"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Category } from "@/types/database";

interface MegaMenuProps {
  categories: (Category & { children: Category[] })[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const activeCategories = categories.filter((c) => c.is_active);

  if (activeCategories.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        Catalogo
      </button>

      {/* Dropdown */}
      <div
        className={`absolute left-1/2 top-full z-50 w-[90vw] max-w-5xl -translate-x-1/2 pt-2 transition-all duration-200 ${
          open
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-2"
        }`}
      >
        <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {activeCategories.map((cat) => (
              <div key={cat.id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {cat.children
                      .filter((c) => c.is_active)
                      .map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/products?category=${child.slug}`}
                            className="text-sm text-neutral-400 hover:text-white transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Promo column */}
            <div className="hidden lg:block rounded-lg bg-gradient-to-br from-red-900/40 to-red-800/20 p-4">
              <p className="text-sm font-semibold text-white">
                Offerte speciali
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Scopri le promozioni attive sul nostro catalogo.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-xs font-medium text-red-400 hover:text-red-300"
                onClick={() => setOpen(false)}
              >
                Vedi tutto &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
