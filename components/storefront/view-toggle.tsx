"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface ViewToggleProps {
  currentView: "grid" | "list";
}

function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = useCallback(
    (view: "grid" | "list") => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === "grid") {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : "/products");
    },
    [searchParams, router]
  );

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-0.5">
      <button
        type="button"
        onClick={() => setView("grid")}
        className={`rounded p-1.5 ${currentView === "grid" ? "bg-red-700 text-white" : "text-gray-500 hover:text-gray-700"}`}
        aria-label="Vista griglia"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setView("list")}
        className={`rounded p-1.5 ${currentView === "list" ? "bg-red-700 text-white" : "text-gray-500 hover:text-gray-700"}`}
        aria-label="Vista lista"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1" y="1" width="14" height="3" rx="1" />
          <rect x="1" y="6.5" width="14" height="3" rx="1" />
          <rect x="1" y="12" width="14" height="3" rx="1" />
        </svg>
      </button>
    </div>
  );
}

export { ViewToggle };
