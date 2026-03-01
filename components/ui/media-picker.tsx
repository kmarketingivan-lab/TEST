"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Upload, Check } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Input } from "./input";
import type { Media } from "@/types/database";

/** Props for the MediaPicker component */
interface MediaPickerProps {
  /** Callback when a media item is selected */
  onSelect: (url: string) => void;
  /** Accepted MIME types (e.g. "image/*", "application/pdf") */
  accept?: string;
  /** Whether the picker modal is open */
  open: boolean;
  /** Callback to close the picker */
  onClose: () => void;
}

/**
 * Modal for selecting media from the library.
 * Shows grid of thumbnails, search by name, filter by folder, and direct upload.
 */
function MediaPicker({ onSelect, accept, open, onClose }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as Media[];
        setMedia(data);
      }
    } catch {
      // Silently fail — media list will be empty
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (open) {
      void loadMedia();
    }
  }, [open, loadMedia]);

  useEffect(() => {
    let result = media;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((m) =>
        m.original_filename.toLowerCase().includes(lowerSearch)
      );
    }
    if (accept === "image/*") {
      result = result.filter((m) => m.mime_type.startsWith("image/"));
    } else if (accept === "application/pdf") {
      result = result.filter((m) => m.mime_type === "application/pdf");
    }
    setFilteredMedia(result);
  }, [media, search, accept]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder || "general");

      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        await loadMedia();
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }, [folder, loadMedia]);

  const handleSelect = useCallback(() => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
      setSelectedUrl(null);
    }
  }, [selectedUrl, onSelect, onClose]);

  const folders = [...new Set(media.map((m) => m.folder))];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Seleziona media"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSelect} disabled={!selectedUrl}>Seleziona</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search and filter */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label=""
              placeholder="Cerca per nome..."
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {folders.length > 0 && (
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              aria-label="Filtra per cartella"
            >
              <option value="">Tutte le cartelle</option>
              {folders.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            {uploading ? "..." : "Upload"}
            <input
              type="file"
              accept={accept ?? "image/*,application/pdf"}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Media grid */}
        {loading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {media.length === 0 ? "Nessun media caricato" : "Nessun risultato"}
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {filteredMedia.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedUrl(m.url)}
                className={`relative aspect-square overflow-hidden rounded border-2 transition-colors
                  ${selectedUrl === m.url ? "border-red-500" : "border-neutral-200 hover:border-neutral-400"}`}
              >
                {m.mime_type.startsWith("image/") ? (
                  <img
                    src={m.url}
                    alt={m.alt_text ?? m.original_filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                    {m.original_filename.split(".").pop()?.toUpperCase()}
                  </div>
                )}
                {selectedUrl === m.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export { MediaPicker };
export type { MediaPickerProps };
