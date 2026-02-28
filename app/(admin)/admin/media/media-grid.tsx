"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteMedia } from "./actions";
import { Upload, Trash2, Copy, Check } from "lucide-react";
import type { Media } from "@/types/database";

interface MediaGridProps {
  media: Media[];
}

function MediaGrid({ media }: MediaGridProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "general");
      await fetch("/api/media/upload", { method: "POST", body: formData });
    }
    setUploading(false);
    router.refresh();
    addToast("success", "File caricati");
  }, [addToast, router]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteMedia(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) addToast("error", result.error);
    else { addToast("success", "File eliminato"); router.refresh(); }
  }, [deleteId, addToast, router]);

  const handleCopy = useCallback(async (id: string, url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast("success", "URL copiato");
    setTimeout(() => setCopiedId(null), 2000);
  }, [addToast]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400"
      >
        <Upload className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-600">
          {uploading ? "Caricamento in corso..." : "Clicca o trascina per caricare file"}
        </span>
        <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
      </div>

      {/* Grid */}
      {media.length === 0 ? (
        <p className="text-center text-sm text-gray-500">Nessun media caricato</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden">
              {item.mime_type.startsWith("image/") ? (
                <img src={item.url} alt={item.alt_text ?? item.original_filename} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gray-100 text-xs text-gray-500">
                  {item.original_filename.split(".").pop()?.toUpperCase()}
                </div>
              )}
              <div className="p-2">
                <p className="truncate text-xs font-medium text-gray-900">{item.original_filename}</p>
                <p className="text-xs text-gray-400">{formatSize(item.size_bytes)}</p>
              </div>
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => void handleCopy(item.id, item.url)}
                  className="rounded bg-white/80 p-1 shadow hover:bg-white"
                  aria-label="Copia URL"
                >
                  {copiedId === item.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="rounded bg-white/80 p-1 shadow hover:bg-white"
                  aria-label="Elimina"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina file"
        description="Sei sicuro di voler eliminare questo file?"
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

export { MediaGrid };
