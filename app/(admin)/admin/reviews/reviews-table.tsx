"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { approveReview, rejectReview } from "./actions";

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  [key: string]: unknown;
}

interface ReviewsTableProps {
  reviews: ReviewRow[];
  currentFilter: string;
}

function ReviewsTable({ reviews, currentFilter }: ReviewsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const setFilter = useCallback(
    (f: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (f === "all") {
        params.delete("filter");
      } else {
        params.set("filter", f);
      }
      router.push(`/admin/reviews?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleApprove = useCallback(
    async (id: string) => {
      const result = await approveReview(id);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", "Recensione approvata");
        router.refresh();
      }
    },
    [addToast, router]
  );

  const handleReject = useCallback(
    async (id: string) => {
      const result = await rejectReview(id);
      if ("error" in result) {
        addToast("error", result.error);
      } else {
        addToast("success", "Recensione rifiutata");
        router.refresh();
      }
    },
    [addToast, router]
  );

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const columns: DataTableColumn<ReviewRow>[] = [
    { header: "Prodotto", accessor: "product_id", sortable: true },
    { header: "Autore", accessor: "author_name" },
    {
      header: "Rating",
      accessor: "rating",
      sortable: true,
      render: (val) => (
        <span className="text-yellow-500">{renderStars(val as number)}</span>
      ),
    },
    { header: "Titolo", accessor: "title" },
    {
      header: "Data",
      accessor: "created_at",
      render: (val) => new Date(val as string).toLocaleDateString("it-IT"),
    },
    {
      header: "Stato",
      accessor: "is_approved",
      render: (val) => (
        <Badge variant={val ? "success" : "warning"}>
          {val ? "Approvata" : "In attesa"}
        </Badge>
      ),
    },
  ];

  const actions: DataTableAction<ReviewRow>[] = [
    {
      label: "Approva",
      onClick: (row) => void handleApprove(row.id),
      show: (row) => !row.is_approved,
    },
    {
      label: "Rifiuta",
      danger: true,
      onClick: (row) => void handleReject(row.id),
    },
    {
      label: "Vedi prodotto",
      onClick: (row) => router.push(`/admin/products/${row.product_id}`),
    },
  ];

  const filters = ["all", "pending", "approved"] as const;
  const filterLabels: Record<string, string> = {
    all: "Tutte",
    pending: "In attesa",
    approved: "Approvate",
  };

  return (
    <>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentFilter === f
                ? "bg-red-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>
      <DataTable<ReviewRow>
        data={reviews}
        columns={columns}
        rowKey="id"
        actions={actions}
        emptyMessage="Nessuna recensione trovata"
      />
    </>
  );
}

export { ReviewsTable };
