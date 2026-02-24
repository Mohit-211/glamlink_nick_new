"use client";

import { BaseFieldProps } from "./index";

export default function TextField<
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(fieldKey, e.target.value as T[keyof T]);
  };

  const handleBlur = () => {
    if (config?.validation?.clearErrorOnFocus && onFocus) {
      onFocus(fieldKey);
    }

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

        <div className="relative">
          <input
            type={config.type || "text"}
            value={(value ?? "") as string}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={config.placeholder}
            disabled={disabled}
            maxLength={config.maxLength}
            className={`
              w-full px-3 py-2 pr-16 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
              border-gray-300 focus:ring-glamlink-teal focus:border-glamlink-teal
              ${
                error
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
              }
            `}
          />

          {/* {config.maxLength && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs text-gray-500">
                {(value ?? "").toString().length} / {config.maxLength}
              </span>
            </div>
          )} */}
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