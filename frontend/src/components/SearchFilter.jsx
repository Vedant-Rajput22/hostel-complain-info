import { useState, useEffect } from 'react';

export default function SearchFilter({ onSearch, placeholder = 'Search...', debounceMs = 300 }) {
    const [value, setValue] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(value);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [value, debounceMs, onSearch]);

    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="input pl-10"
            />
            <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
            {value && (
                <button
                    onClick={() => setValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    ×
                </button>
            )}
        </div>
    );
}

export function FilterSelect({ label, value, onChange, options, className = '' }) {
    return (
        <div className={className}>
            {label && <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">{label}</label>}
            <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange, className = '' }) {
    return (
        <div className={`flex gap-2 ${className}`}>
            <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">From</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartChange(e.target.value)}
                    className="input"
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">To</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndChange(e.target.value)}
                    className="input"
                />
            </div>
        </div>
    );
}


