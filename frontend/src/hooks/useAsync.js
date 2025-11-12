import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling async operations with loading, error, and data states
 */
export const useAsync = (asyncFunction, immediate = true, dependencies = []) => {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...params) => {
            setStatus('pending');
            setData(null);
            setError(null);

            try {
                const response = await asyncFunction(...params);
                setData(response);
                setStatus('success');
                return response;
            } catch (err) {
                setError(err);
                setStatus('error');
                throw err;
            }
        },
        [asyncFunction]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, dependencies);

    return {
        execute,
        status,
        data,
        error,
        isIdle: status === 'idle',
        isPending: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error',
    };
};

/**
 * Hook for managing form submission with async operations
 */
export const useAsyncForm = (onSubmit) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e, ...args) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await onSubmit(e, ...args);
            setSuccess(true);
            return true;
        } catch (err) {
            setError(err?.error || err?.message || 'An error occurred');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setIsSubmitting(false);
        setError(null);
        setSuccess(false);
    };

    return {
        handleSubmit,
        isSubmitting,
        error,
        success,
        reset,
    };
};


