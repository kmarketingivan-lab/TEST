"use client";

import { forwardRef } from "react";

/** A single option for the Select component */
interface SelectOption {
  label: string;
  value: string;
}

/** Props for the Select component */
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /** Select label displayed above the field */
  label: string;
  /** Error message to display below the field */
  error?: string;
  /** Help text displayed below the field */
  description?: string;
  /** Array of options to display */
  options: SelectOption[];
  /** Placeholder text for empty selection */
  placeholder?: string;
}

/**
 * Reusable native Select component with label, error, and options array.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, description, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${selectId}-error` : description ? `${selectId}-desc` : undefined
          }
          className={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors bg-white
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-700
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
            ${className ?? ""}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {description && !error && (
          <p id={`${selectId}-desc`} className="text-xs text-gray-500">
            {description}
          </p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps, SelectOption };
