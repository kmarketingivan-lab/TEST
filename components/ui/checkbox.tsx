"use client";

import { forwardRef } from "react";

/** Props for the Checkbox component */
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Checkbox label displayed next to the field */
  label: string;
}

/**
 * Reusable Checkbox component with label.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const checkboxId = id ?? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`h-4 w-4 rounded border-gray-300 accent-red-700 text-red-700
            focus:ring-2 focus:ring-red-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${className ?? ""}`}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm text-gray-700 select-none">
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
export type { CheckboxProps };
