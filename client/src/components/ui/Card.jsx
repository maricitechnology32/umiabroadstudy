import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 shadow-sm ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => {
    return (
        <div className={`p-6 pb-2 ${className}`}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className = '' }) => {
    return (
        <h3 className="font-semibold leading-none tracking-tight text-secondary-900 dark:text-secondary-50">
            {children}
        </h3>
    );
};

export const CardContent = ({ children, className = '' }) => {
    return (
        <div className={`p-6 pt-2 ${className}`}>
            {children}
        </div>
    );
};
