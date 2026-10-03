import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Enterprise Select Dropdown Component
 */
export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      children,
      className = '',
      id,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={`
              w-full text-sm text-slate-900 bg-white border rounded-lg transition-colors appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              pl-3 pr-9 py-2 min-h-[40px]
              ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 hover:border-slate-400'}
              ${className}
            `}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
