"use client";

import { BaseFieldProps } from "./index";
import TiptapEditor from "@/lib/pages/admin/components/shared/editing/fields/html/TiptapEditor";

/**
 * TiptapField - Rich text editor field for apply forms
 */
export default function TiptapField<
  T extends Record<string, any> = Record<string, any>
>({
  fieldKey,
  config,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled,
}: BaseFieldProps<T>) {
  const handleChange = (htmlValue: string) => {
    onChange(fieldKey, htmlValue as T[keyof T]);
  };

  const handleBlur = () => {
    if (config?.validation?.validateOnBlur && onBlur) {
      onBlur(fieldKey);
    }
  };

  const handleFocus = () => {
    if (config?.validation?.clearErrorOnFocus && onFocus) {
      onFocus(fieldKey);
    }
  };

  return (
    <div className="transition-all duration-200">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {config.label}
          {config.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>

        <div
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={error ? "ring-1 ring-red-500 rounded-md" : ""}
        >
          <TiptapEditor
            value={(value ?? "") as string}
            onChange={handleChange}
            disabled={disabled}
            minHeight={config.rows ? config.rows * 24 : 100}
            placeholder={config.placeholder}
            showHtmlButton={false}
            maxLength={config.validation?.maxLength}
            showCharCount={
              config.validation?.maxLength !== undefined
            }
          />
        </div>

        {config.description && (
          <p className="text-sm text-gray-500">
            {config.description}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}