import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Authentication failed. Please try again.');
            navigate('/login');
            return;
        }

        if (token) {
            // Store tokens in localStorage (optional, cookies are already set by backend)
            localStorage.setItem('token', token);
            if (refresh) {
                localStorage.setItem('refreshToken', refresh);
            }

            toast.success('Successfully signed in with Google!');
            navigate('/');
        } else {
            toast.error('Authentication failed. No token received.');
            navigate('/login');
        }
    }, [searchParams, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Completing sign in...
                </p>
            </div>
        </div>
    );
}






