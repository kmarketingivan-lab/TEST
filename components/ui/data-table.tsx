"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal } from "lucide-react";

/** Column definition for DataTable */
interface DataTableColumn<T> {
  /** Column header text */
  header: string;
  /** Key to access data or custom accessor */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Sort key — defaults to accessor if it's a string */
  sortKey?: keyof T;
  /** Custom render function */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Column CSS class */
  className?: string;
}

/** Row action definition */
interface DataTableAction<T> {
  /** Action label */
  label: string;
  /** Action handler */
  onClick: (row: T) => void;
  /** Whether this action is destructive (red text) */
  danger?: boolean;
  /** Condition for showing this action */
  show?: (row: T) => boolean;
}

/** Props for DataTable component */
interface DataTableProps<T> {
  /** Array of data rows */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Unique key accessor for each row */
  rowKey: keyof T;
  /** Actions available per row */
  actions?: DataTableAction<T>[];
  /** Whether rows are selectable with checkboxes */
  selectable?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedKeys: string[]) => void;
  /** Current page (1-based) */
  page?: number;
  /** Items per page */
  perPage?: number;
  /** Total items count (for server-side pagination) */
  totalCount?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Whether data is loading */
  loading?: boolean;
  /** Message to display when data is empty */
  emptyMessage?: string;
}

/**
 * Reusable DataTable component with sorting, pagination, row selection, and per-row actions.
 * Supports generic typing via DataTable<T>.
 */
function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  actions,
  selectable,
  onSelectionChange,
  page = 1,
  perPage = 20,
  totalCount,
  onPageChange,
  loading,
  emptyMessage = "Nessun dato trovato",
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [openActionRow, setOpenActionRow] = useState<string | null>(null);

  const total = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortCol, sortDir]);

  const handleSort = useCallback((col: DataTableColumn<T>) => {
    const key = col.sortKey ?? (typeof col.accessor === "string" ? col.accessor : null);
    if (!key) return;
    setSortCol((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const toggleSelect = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [onSelectionChange]);

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      if (prev.size === sortedData.length) {
        onSelectionChange?.([]);
        return new Set();
      }
      const allKeys = sortedData.map((r) => String(r[rowKey]));
      onSelectionChange?.(allKeys);
      return new Set(allKeys);
    });
  }, [sortedData, rowKey, onSelectionChange]);

  const getCellValue = (row: T, col: DataTableColumn<T>): React.ReactNode => {
    const raw = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
    if (col.render) return col.render(raw, row);
    if (raw == null) return "—";
    return String(raw);
  };

  const getSortIcon = (col: DataTableColumn<T>) => {
    const key = col.sortKey ?? (typeof col.accessor === "string" ? col.accessor : null);
    if (!key || !col.sortable) return null;
    if (sortCol === key) {
      return sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {selectable && <th className="w-10 px-3 py-3" />}
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-3 text-left font-medium text-gray-500">
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && <th className="w-10 px-3 py-3" />}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-200">
                {selectable && <td className="px-3 py-3"><div className="h-4 w-4 animate-pulse rounded bg-gray-200" /></td>}
                {columns.map((col) => (
                  <td key={col.header} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
                {actions && actions.length > 0 && <td className="px-3 py-3"><div className="h-4 w-4 animate-pulse rounded bg-gray-200" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedKeys.size === sortedData.length && sortedData.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Seleziona tutti"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`px-4 py-3 text-left font-medium text-gray-500 ${col.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""} ${col.className ?? ""}`}
                  onClick={col.sortable ? () => handleSort(col) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {getSortIcon(col)}
                  </span>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="w-10 px-3 py-3">
                  <span className="sr-only">Azioni</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const key = String(row[rowKey]);
              return (
                <tr key={key} className="border-t border-gray-200 hover:bg-gray-50">
                  {selectable && (
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(key)}
                        onChange={() => toggleSelect(key)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Seleziona riga ${key}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.header} className={`px-4 py-3 text-gray-900 ${col.className ?? ""}`}>
                      {getCellValue(row, col)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="relative px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setOpenActionRow(openActionRow === key ? null : key)}
                        className="rounded p-1 hover:bg-gray-200"
                        aria-label="Azioni riga"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openActionRow === key && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenActionRow(null)} aria-hidden="true" />
                          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                            {actions
                              .filter((a) => !a.show || a.show(row))
                              .map((action) => (
                                <button
                                  key={action.label}
                                  type="button"
                                  onClick={() => {
                                    setOpenActionRow(null);
                                    action.onClick(row);
                                  }}
                                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100
                                    ${action.danger ? "text-red-600" : "text-gray-700"}`}
                                >
                                  {action.label}
                                </button>
                              ))}
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Pagina {page} di {totalPages} ({total} risultati)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Precedente
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
export type { DataTableColumn, DataTableAction, DataTableProps };
