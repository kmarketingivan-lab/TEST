"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority = false,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className ?? ""}`}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={alt}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const imageProps: Record<string, unknown> = {
    src,
    alt,
    sizes: sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    priority,
    onError: () => setHasError(true),
  };
  if (fill) {
    imageProps.fill = true;
  } else {
    imageProps.width = width ?? 400;
    imageProps.height = height ?? 400;
  }
  if (className) {
    imageProps.className = className;
  }
  if (!priority) {
    imageProps.loading = "lazy" as const;
  }

  return <Image {...(imageProps as unknown as React.ComponentProps<typeof Image>)} />;
}
