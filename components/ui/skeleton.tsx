/** Props for the Skeleton component */
interface SkeletonProps {
  /** CSS class for sizing and shape */
  className?: string;
}

/**
 * Base skeleton loader block — animates with pulse.
 */
function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className ?? "h-4 w-full"}`}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for a card layout.
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <Skeleton className="h-40 w-full rounded-md" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a table row.
 */
function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-t border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-20" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for form fields.
 */
function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTableRow, SkeletonForm };
export type { SkeletonProps };
