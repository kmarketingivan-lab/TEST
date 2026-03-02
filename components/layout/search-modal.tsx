"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Product } from "@/types/database";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=6`);
      const data: Product[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void doSearch(value);
    }, 300);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center text-neutral-300 hover:text-white transition-colors"
        aria-label="Cerca"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-neutral-700 px-4 py-3">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Cerca prodotti..."
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-4 text-center text-sm text-neutral-500">
                  Ricerca...
                </p>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-neutral-500">
                  Nessun risultato per &quot;{query}&quot;
                </p>
              )}

              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-neutral-800 transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-800">
                    {product.seo_description ? null : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-600">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}

              {results.length > 0 && (
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-center text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Vedi tutti i risultati &rarr;
                </Link>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-neutral-700 px-4 py-2 text-xs text-neutral-500">
              <kbd className="rounded border border-neutral-600 px-1.5 py-0.5 text-[10px]">
                ESC
              </kbd>{" "}
              per chiudere
            </div>
          </div>
        </div>
      )}
    </>
  );
}
