"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "@/components/storefront/wishlist-action";

interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  isLoggedIn: boolean;
}

function WishlistButton({ productId, isInWishlist, isLoggedIn }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(isInWishlist);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = useCallback(async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    const result = await toggleWishlistAction(productId, wishlisted);
    setLoading(false);

    if (!("error" in result)) {
      setWishlisted(!wishlisted);
    }
  }, [productId, wishlisted, isLoggedIn, router]);

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      aria-label={wishlisted ? "Rimuovi dalla lista desideri" : "Aggiungi alla lista desideri"}
    >
      <svg
        className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {wishlisted ? "Nella lista" : "Lista desideri"}
    </button>
  );
}

export { WishlistButton };
