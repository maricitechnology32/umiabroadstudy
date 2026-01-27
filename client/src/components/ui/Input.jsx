import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', id, leftIcon, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={`
              flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-800 dark:bg-secondary-950 dark:ring-offset-secondary-950 dark:placeholder:text-secondary-400
              ${leftIcon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
              ${className}
            `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
