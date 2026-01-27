import { Loader2 } from 'lucide-react';

/**
 * Professional Loader Component with multiple variants
 * 
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'spinner' | 'dots' | 'pulse' | 'bars'
 * @param {string} text - Optional loading text
 * @param {boolean} fullScreen - Center in viewport
 * @param {boolean} overlay - Show with backdrop overlay
 */
export default function Loader({
    size = 'md',
    variant = 'spinner',
    text = '',
    fullScreen = false,
    overlay = false,
    className = ''
}) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return (
                    <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`rounded-full bg-primary-600 animate-bounce ${size === 'sm' ? 'w-1.5 h-1.5' :
                                        size === 'md' ? 'w-2 h-2' :
                                            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
                                    }`}
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                );

            case 'pulse':
                return (
                    <div className="relative">
                        <div className={`${sizeClasses[size]} rounded-full bg-primary-600 animate-ping absolute opacity-75`} />
                        <div className={`${sizeClasses[size]} rounded-full bg-primary-600 relative`} />
                    </div>
                );

            case 'bars':
                return (
                    <div className="flex items-end gap-1 h-6">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`bg-primary-600 rounded-sm animate-pulse ${size === 'sm' ? 'w-1' :
                                        size === 'md' ? 'w-1.5' :
                                            size === 'lg' ? 'w-2' : 'w-3'
                                    }`}
                                style={{
                                    height: `${40 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '0.8s'
                                }}
                            />
                        ))}
                    </div>
                );

            case 'spinner':
            default:
                return (
                    <Loader2
                        className={`${sizeClasses[size]} text-primary-600 animate-spin`}
                    />
                );
        }
    };

    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            {renderLoader()}
            {text && (
                <p className={`${textSizes[size]} text-slate-600 font-medium animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlay ? 'bg-white/80 backdrop-blur-sm' : 'bg-gradient-to-br from-slate-50 via-white to-primary-50'
                }`}>
                {content}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-inherit">
                {content}
            </div>
        );
    }

    return content;
}

/**
 * Page Loader - Full page loading state
 */
export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-150" />

                {/* Spinner */}
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                </div>
            </div>
            <p className="mt-4 text-slate-600 font-medium animate-pulse">{text}</p>
        </div>
    );
}

/**
 * Skeleton Loader - For content placeholders
 */
export function Skeleton({ className = '', variant = 'text' }) {
    const baseClass = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded';

    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        card: 'h-32 w-full rounded-xl',
        button: 'h-10 w-24 rounded-lg',
        image: 'h-48 w-full rounded-xl'
    };

    return (
        <div
            className={`${baseClass} ${variants[variant] || ''} ${className}`}
            style={{ animation: 'shimmer 1.5s infinite' }}
        />
    );
}

/**
 * Card Skeleton - For loading card placeholders
 */
export function CardSkeleton({ count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton variant="avatar" />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="title" className="w-1/2" />
                            <Skeleton variant="text" className="w-1/3" />
                        </div>
                    </div>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" className="w-4/5" />
                </div>
            ))}
        </>
    );
}

/**
 * Table Skeleton - For loading table rows
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-slate-100">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton
                            key={j}
                            variant="text"
                            className={j === 0 ? 'w-1/6' : 'flex-1'}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Button Loader - Inline loading state for buttons
 */
export function ButtonLoader({ size = 'sm' }) {
    return (
        <Loader2 className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}`} />
    );
}
