import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRTL?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', isRTL = false, ...props }, ref) => {
    return (
      <div className="space-y-1" dir={isRTL ? 'rtl' : 'ltr'}>
        {label && (
          <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${isRTL ? 'text-right' : 'text-left'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>}
        {helperText && !error && <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
