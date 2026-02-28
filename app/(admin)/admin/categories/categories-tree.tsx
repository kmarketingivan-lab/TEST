"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteCategory } from "./actions";
import { Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { Category } from "@/types/database";

interface CategoriesTreeProps {
  tree: (Category & { children: Category[] })[];
}

/**
 * Tree view of categories with parent/children hierarchy.
 */
function CategoriesTree({ tree }: CategoriesTreeProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(tree.map((c) => c.id)));

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCategory(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if ("error" in result) {
      addToast("error", result.error);
    } else {
      addToast("success", "Categoria eliminata");
      router.refresh();
    }
  }, [deleteId, addToast, router]);

  if (tree.length === 0) {
    return <p className="text-sm text-gray-500">Nessuna categoria. Crea la prima!</p>;
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white">
        {tree.map((parent) => (
          <div key={parent.id} className="border-b border-gray-100 last:border-b-0">
            <CategoryRow
              category={parent}
              level={0}
              hasChildren={parent.children.length > 0}
              isExpanded={expanded.has(parent.id)}
              onToggle={() => toggleExpand(parent.id)}
              onEdit={() => router.push(`/admin/categories/${parent.id}/edit`)}
              onDelete={() => setDeleteId(parent.id)}
            />
            {expanded.has(parent.id) &&
              parent.children.map((child) => (
                <CategoryRow
                  key={child.id}
                  category={child}
                  level={1}
                  hasChildren={false}
                  isExpanded={false}
                  onToggle={() => {}}
                  onEdit={() => router.push(`/admin/categories/${child.id}/edit`)}
                  onDelete={() => setDeleteId(child.id)}
                />
              ))}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
        title="Elimina categoria"
        description="Sei sicuro? I prodotti in questa categoria non verranno eliminati."
        confirmLabel="Elimina"
        danger
        loading={deleting}
      />
    </>
  );
}

interface CategoryRowProps {
  category: Category;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CategoryRow({ category, level, hasChildren, isExpanded, onToggle, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
      style={{ paddingLeft: `${16 + level * 24}px` }}
    >
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <button type="button" onClick={onToggle} className="p-0.5 text-gray-500">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span className="text-sm font-medium text-gray-900">{category.name}</span>
        <span className="text-xs text-gray-400">/{category.slug}</span>
        <Badge variant={category.is_active ? "success" : "error"}>
          {category.is_active ? "Attiva" : "Inattiva"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded p-1 text-gray-500 hover:bg-gray-200"
          aria-label="Modifica"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-red-500 hover:bg-red-50"
          aria-label="Elimina"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export { CategoriesTree };
