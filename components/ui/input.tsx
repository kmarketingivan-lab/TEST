"use client";

import { forwardRef } from "react";

type InputVariant = "text" | "email" | "number" | "password" | "search" | "tel" | "url";

/** Props for the Input component */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Input label displayed above the field */
  label: string;
  /** Error message to display below the field */
  error?: string;
  /** Help text displayed below the field */
  description?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Input type variant */
  type?: InputVariant;
}

/**
 * Reusable Input component with label, error, and description support.
 * Supports text, email, number, password, search, tel, url variants.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, description, required, type = "text", className, id, ...props }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : description ? `${inputId}-desc` : undefined
          }
          className={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-700
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
            ${className ?? ""}`}
          {...props}
        />
        {description && !error && (
          <p id={`${inputId}-desc`} className="text-xs text-gray-500">
            {description}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
