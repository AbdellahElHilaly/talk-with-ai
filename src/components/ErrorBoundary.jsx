import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        
                        <h1 className="text-xl font-bold text-slate-900 mb-4">
                            Oops! Something went wrong
                        </h1>
                        <h1 className="text-xl font-bold text-slate-900 mb-4 arabic-text">
                            عذراً! حدث خطأ ما
                        </h1>
                        
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                            Don't worry, this happens sometimes. Try refreshing the page or resetting the app.
                        </p>
                        <p className="text-slate-600 mb-6 text-sm leading-relaxed arabic-text">
                            لا تقلق، هذا يحدث أحياناً. جرب تحديث الصفحة أو إعادة تشغيل التطبيق.
                        </p>
                        
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
                            >
                                Try Again / حاول مرة أخرى
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-brand-indigo text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh / تحديث
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6 text-left">
                                <summary className="text-xs font-mono text-slate-400 cursor-pointer">
                                    Error Details (Dev)
                                </summary>
                                <pre className="text-xs text-rose-600 mt-2 p-3 bg-rose-50 rounded-lg overflow-auto">
                                    {this.state.error?.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;