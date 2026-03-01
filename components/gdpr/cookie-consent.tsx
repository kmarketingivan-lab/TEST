"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type ConsentValue = "all" | "necessary" | CookiePreferences;

const COOKIE_NAME = "cookie_consent";
const COOKIE_DAYS = 365;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getCookie(COOKIE_NAME);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  // Focus trap
  useEffect(() => {
    if (!visible) return;
    const el = bannerRef.current;
    if (!el) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !el) return;
      const focusable = el.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0] as HTMLElement | undefined;
      const last = focusable[focusable.length - 1] as HTMLElement | undefined;
      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Focus first button
    const firstBtn = el.querySelector<HTMLElement>("button");
    firstBtn?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, showSettings]);

  const saveConsent = useCallback((value: ConsentValue) => {
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    setCookie(COOKIE_NAME, raw, COOKIE_DAYS);
    setVisible(false);
    setShowSettings(false);
  }, []);

  const handleAcceptAll = useCallback(() => saveConsent("all"), [saveConsent]);
  const handleNecessaryOnly = useCallback(() => saveConsent("necessary"), [saveConsent]);
  const handleSavePreferences = useCallback(() => {
    saveConsent({ necessary: true, analytics, marketing });
  }, [saveConsent, analytics, marketing]);

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Consenso cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-700 bg-neutral-900 p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto max-w-5xl">
        {!showSettings ? (
          <>
            <p className="text-sm leading-relaxed text-white">
              Questo sito utilizza cookie tecnici e, con il tuo consenso, cookie
              di profilazione per migliorare la tua esperienza. Puoi accettare,
              rifiutare o personalizzare le tue preferenze.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleAcceptAll}
                className="rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Accetta tutti
              </button>
              <button
                onClick={handleNecessaryOnly}
                className="rounded-md border border-white px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Solo necessari
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-md px-5 py-2 text-sm font-semibold text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Personalizza
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-white">
              Personalizza preferenze cookie
            </h2>
            <div className="mt-4 space-y-3">
              {/* Necessary - always on */}
              <label className="flex items-center justify-between">
                <span className="text-sm text-white">
                  Necessari{" "}
                  <span className="text-neutral-400">(sempre attivi)</span>
                </span>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-5 w-5 accent-red-700"
                />
              </label>
              {/* Analytics */}
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-white">Analitici</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-5 w-5 accent-red-700"
                />
              </label>
              {/* Marketing */}
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-white">Marketing</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-5 w-5 accent-red-700"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleSavePreferences}
                className="rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Salva preferenze
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-md px-5 py-2 text-sm font-semibold text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
              >
                Indietro
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
