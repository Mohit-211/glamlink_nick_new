"use client";

import { BaseFieldProps } from "./index";

/**
 * Formats a phone number string to (XXX)-XXX-XXXX format
 * Only allows digits, max 10 digits
 */
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const limitedDigits = digits.slice(0, 10);

  if (limitedDigits.length === 0) {
    return "";
  } else if (limitedDigits.length <= 3) {
    return `(${limitedDigits}`;
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(3)}`;
  } else {
    return `(${limitedDigits.slice(0, 3)})-${limitedDigits.slice(
      3,
      6
    )}-${limitedDigits.slice(6)}`;
  }
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function PhoneField<
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
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);

    onChange(fieldKey, formatted as T[keyof T]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key)) return;

    if (e.ctrlKey || e.metaKey) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    const currentDigits = extractDigits((value ?? "") as string);
    if (currentDigits.length >= 10) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(fieldKey);
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus(fieldKey);
    }
  };

  const displayValue = value
    ? formatPhoneNumber((value ?? "") as string)
    : "";

  const digitCount = extractDigits((value ?? "") as string).length;

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
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={config.placeholder || "(555)-123-4567"}
            disabled={disabled}
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

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span
              className={`text-xs ${
                digitCount === 10
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
              {digitCount} / 10
            </span>
          </div>
        </div>

        {config.helperText && (
          <p className="text-sm text-gray-500">
            {config.helperText}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}