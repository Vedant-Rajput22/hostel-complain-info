export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
            />
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="card space-y-3 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="card">
            <div className="space-y-3">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        {[...Array(cols)].map((_, j) => (
                            <div
                                key={j}
                                className="h-4 bg-gray-200 dark:bg-gray-800 rounded flex-1 animate-pulse"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}


