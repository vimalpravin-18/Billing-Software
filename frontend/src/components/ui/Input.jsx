import React, { forwardRef } from 'react';

/**
 * Enterprise Form Input Component
 */
export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = '',
      id,
      type = 'text',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={`
              w-full text-sm text-slate-900 bg-white border rounded-lg transition-colors
              placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${Icon ? 'pl-9' : 'pl-3'}
              ${RightIcon ? 'pr-9' : 'pr-3'}
              py-2 min-h-[40px]
              ${error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 hover:border-slate-400'}
              ${className}
            `}
            {...props}
          />

          {RightIcon && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onRightIconClick}
              className={`absolute right-3 text-slate-400 hover:text-slate-600 flex items-center justify-center ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <RightIcon className="w-4 h-4" />
            </button>
          )}
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

Input.displayName = 'Input';

export default Input;
