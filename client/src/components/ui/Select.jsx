import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, className = '', id, children, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={id}
                    ref={ref}
                    className={`
                      appearance-none cursor-pointer
                      flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 pr-10 text-sm text-secondary-900
                      shadow-sm transition-all duration-200
                      ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-primary-400
                      hover:border-secondary-300 hover:bg-secondary-50/50
                      disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-100
                      dark:border-secondary-800 dark:bg-secondary-950 dark:ring-offset-secondary-950 dark:text-secondary-50
                      ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>
                {/* Custom Chevron Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                    <ChevronDown size={16} strokeWidth={2.5} />
                </div>
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;

