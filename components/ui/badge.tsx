type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

/** Props for the Badge component */
interface BadgeProps {
  /** Badge variant (color scheme) */
  variant?: BadgeVariant;
  /** Badge content text */
  children: React.ReactNode;
  /** Optional CSS class */
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

/**
 * Mapping from common status strings to badge variants.
 * active, published, confirmed, delivered, completed → success
 * draft, pending → warning
 * cancelled, inactive, no_show → error
 * processing, shipped → info
 */
const statusVariantMap: Record<string, BadgeVariant> = {
  active: "success",
  published: "success",
  confirmed: "success",
  delivered: "success",
  completed: "success",
  draft: "warning",
  pending: "warning",
  cancelled: "error",
  inactive: "error",
  no_show: "error",
  refunded: "error",
  processing: "info",
  shipped: "info",
};

/**
 * Get the badge variant for a given status string.
 * @param status - Status string (e.g. "published", "draft", "cancelled")
 * @returns Badge variant
 */
function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status.toLowerCase()] ?? "default";
}

/**
 * Small badge for status labels with colored background.
 */
function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

export { Badge, getStatusVariant };
export type { BadgeProps, BadgeVariant };
