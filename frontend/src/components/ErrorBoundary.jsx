import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
                    <div className="max-w-md w-full">
                        <div className="card text-center space-y-4">
                            <div className="text-red-500 text-5xl">⚠️</div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Something went wrong
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left mt-4">
                                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                        Error details
                                    </summary>
                                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn"
                                >
                                    Refresh Page
                                </button>
                                <button
                                    onClick={() => (window.location.href = '/')}
                                    className="btn btn-secondary"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


