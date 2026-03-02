"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  exportUrl: string;
  label?: string;
  formats?: string[];
}

function ExportButton({ exportUrl, label = "Esporta", formats = ["csv"] }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = useCallback(
    (format: string) => {
      setOpen(false);
      const separator = exportUrl.includes("?") ? "&" : "?";
      window.open(`${exportUrl}${separator}format=${format}`, "_blank");
    },
    [exportUrl]
  );

  if (formats.length === 1) {
    return (
      <Button variant="secondary" size="sm" onClick={() => handleExport(formats[0] ?? "csv")}>
        <Download className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
        <Download className="h-4 w-4" />
        {label}
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {formats.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleExport(f)}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ExportButton };
