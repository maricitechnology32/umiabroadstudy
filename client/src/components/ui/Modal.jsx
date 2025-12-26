import { X } from 'lucide-react';
import React, { useEffect } from 'react';

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-[90vw]'
};
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-xl sm:rounded-2xl shadow-xl w-full ${sizeClasses[size] || sizeClasses.md} overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 my-4 sm:my-0 max-h-[90vh] flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 pr-4 truncate">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Body - scrollable */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

