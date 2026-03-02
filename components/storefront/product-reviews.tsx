"use client";

import { useState, useCallback } from "react";
import type { Review } from "@/types/database";
import { ReviewForm } from "@/components/storefront/review-form";

interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  stats: ReviewStats;
  totalCount: number;
  isLoggedIn: boolean;
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" | undefined }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductReviews({ productId, reviews, stats, totalCount, isLoggedIn }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Average */}
        <div className="text-center sm:w-48">
          <div className="text-4xl font-bold text-gray-900">{stats.avg > 0 ? stats.avg.toFixed(1) : "—"}</div>
          <StarDisplay rating={Math.round(stats.avg)} size="lg" />
          <p className="mt-1 text-sm text-gray-500">{stats.count} recension{stats.count === 1 ? "e" : "i"}</p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] ?? 0;
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-right text-gray-600">{star}</span>
                <svg className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review button */}
      <div>
        {isLoggedIn ? (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            {showForm ? "Annulla" : "Scrivi una recensione"}
          </button>
        ) : (
          <a
            href="/auth/login"
            className="inline-block rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Accedi per scrivere una recensione
          </a>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <ReviewForm productId={productId} onSuccess={() => setShowForm(false)} />
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <div key={review.id} className="py-4">
              <div className="flex items-center gap-2">
                <StarDisplay rating={review.rating} />
                {review.title && (
                  <span className="font-medium text-gray-900">{review.title}</span>
                )}
              </div>
              {review.body && (
                <p className="mt-2 text-sm text-gray-700">{review.body}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {review.author_name} &mdash; {formatDate(review.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nessuna recensione ancora. Sii il primo!</p>
      )}

      {totalCount > reviews.length && (
        <p className="text-sm text-gray-500">
          Visualizzate {reviews.length} di {totalCount} recensioni
        </p>
      )}
    </div>
  );
}

export { ProductReviews, StarDisplay };
export type { ProductReviewsProps };
