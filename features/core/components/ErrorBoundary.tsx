import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">出错了</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            抱歉，应用程序遇到了一些意外错误。
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            刷新页面
                        </button>
                        {this.state.error && (
                            <div className="mt-6 text-left">
                                <p className="text-xs text-slate-400 mb-1">错误详情:</p>
                                <pre className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded text-xs text-red-400 overflow-auto max-h-40 border border-slate-200 dark:border-slate-700">
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
