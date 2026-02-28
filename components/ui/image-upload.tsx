"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

/** Props for the ImageUpload component */
interface ImageUploadProps {
  /** Current image URL (for preview) */
  value?: string;
  /** Callback when upload completes with the URL */
  onChange: (url: string) => void;
  /** Callback to clear the current image */
  onClear?: () => void;
  /** Accepted MIME types */
  accept?: string;
  /** Maximum file size in bytes (default 5MB) */
  maxSize?: number;
  /** Upload folder */
  folder?: string;
}

/**
 * Drop zone for direct image upload with preview and progress.
 * Validates file type and size client-side before upload.
 */
function ImageUpload({
  value,
  onChange,
  onClear,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  folder = "general",
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept === "image/*" && !file.type.startsWith("image/")) {
        return "Il file deve essere un'immagine";
      }
      if (file.size > maxSize) {
        const maxMB = Math.round(maxSize / 1024 / 1024);
        return `Il file deve essere inferiore a ${maxMB}MB`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(30);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        setProgress(60);
        const res = await fetch("/api/media/upload", { method: "POST", body: formData });

        if (!res.ok) {
          setError("Errore nel caricamento");
          return;
        }

        setProgress(90);
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          onChange(data.url);
        }
        setProgress(100);
      } catch {
        setError("Errore nel caricamento del file");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [validateFile, onChange, folder]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  if (value) {
    return (
      <div className="relative inline-block">
        <img
          src={value}
          alt="Anteprima"
          className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
        />
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
            aria-label="Rimuovi immagine"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
          ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        {uploading ? (
          <>
            <Upload className="h-8 w-8 animate-bounce text-blue-500" />
            <p className="mt-2 text-sm text-gray-600">Caricamento in corso...</p>
            <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Trascina un&apos;immagine o clicca per caricare
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Max {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}

export { ImageUpload };
export type { ImageUploadProps };
