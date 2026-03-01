"use client";

import { forwardRef, useState, useCallback } from "react";

/** Props for the Textarea component */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea label displayed above the field */
  label: string;
  /** Error message to display below the field */
  error?: string;
  /** Help text displayed below the field */
  description?: string;
  /** Whether to show character count */
  showCount?: boolean;
}

/**
 * Reusable Textarea component with label, error, description, and optional character count.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, description, showCount, maxLength, className, id, onChange, value, defaultValue, ...props }, ref) => {
    const textareaId = id ?? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const [charCount, setCharCount] = useState(() => {
      if (typeof value === "string") return value.length;
      if (typeof defaultValue === "string") return defaultValue.length;
      return 0;
    });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        onChange?.(e);
      },
      [onChange]
    );

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${textareaId}-error` : description ? `${textareaId}-desc` : undefined
          }
          onChange={handleChange}
          className={`rounded-md border px-3 py-2 text-sm shadow-sm transition-colors resize-y min-h-[80px]
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-700
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
            ${className ?? ""}`}
          {...props}
        />
        <div className="flex justify-between">
          {description && !error && (
            <p id={`${textareaId}-desc`} className="text-xs text-gray-500">
              {description}
            </p>
          )}
          {error && (
            <p id={`${textareaId}-error`} className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          {showCount && (
            <p className="text-xs text-gray-400 ml-auto">
              {charCount}{maxLength ? `/${maxLength}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
