import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";

/** Props for the Alert component */
interface AlertProps {
  /** Alert type — determines color and icon */
  type: AlertType;
  /** Alert message */
  children: React.ReactNode;
  /** Optional CSS class */
  className?: string;
}

const alertStyles: Record<AlertType, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-red-50 border-red-300 text-red-800",
};

const alertIcons: Record<AlertType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-red-500 shrink-0" />,
};

/**
 * Inline alert banner — success, error, warning, info.
 */
function Alert({ type, children, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${alertStyles[type]} ${className ?? ""}`}
    >
      {alertIcons[type]}
      <div>{children}</div>
    </div>
  );
}

export { Alert };
export type { AlertProps, AlertType };
