"use client";

import { useState } from "react";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import type { Review } from "@/types/database";
import { ProductReviews } from "@/components/storefront/product-reviews";

interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

interface ProductTabsProps {
  richDescription: string | null;
  specifications: Record<string, unknown>;
  regulatoryInfo: string | null;
  productId: string;
  reviews: Review[];
  reviewStats: ReviewStats;
  reviewTotalCount: number;
  isLoggedIn: boolean;
}

interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

function ProductTabs({
  richDescription,
  specifications,
  regulatoryInfo,
  productId,
  reviews,
  reviewStats,
  reviewTotalCount,
  isLoggedIn,
}: ProductTabsProps) {
  const tabs: TabDef[] = [];

  if (richDescription) {
    tabs.push({
      id: "description",
      label: "Descrizione",
      content: <RichTextDisplay html={richDescription} />,
    });
  }

  const specEntries = Object.entries(specifications);
  if (specEntries.length > 0) {
    tabs.push({
      id: "specs",
      label: "Specifiche",
      content: (
        <table className="w-full text-sm">
          <tbody>
            {specEntries.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-600">{key}</td>
                <td className="py-2 text-gray-900">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }

  if (regulatoryInfo) {
    tabs.push({
      id: "regulatory",
      label: "Normativa",
      content: (
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">{regulatoryInfo}</p>
          </div>
        </div>
      ),
    });
  }

  tabs.push({
    id: "reviews",
    label: `Recensioni (${reviewStats.count})`,
    content: (
      <ProductReviews
        productId={productId}
        reviews={reviews}
        stats={reviewStats}
        totalCount={reviewTotalCount}
        isLoggedIn={isLoggedIn}
      />
    ),
  });

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  if (tabs.length === 0) return null;

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div>
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="py-6">{activeContent}</div>
    </div>
  );
}

export { ProductTabs };
