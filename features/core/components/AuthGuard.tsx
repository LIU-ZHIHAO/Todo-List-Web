import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * 认证守卫组件
 * 确保用户必须登录才能访问内容
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user, loading } = useAuth();

    // 加载中状态
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-blue-500" />
                    <p className="text-slate-600 dark:text-slate-400">加载中...</p>
                </div>
            </div>
        );
    }

    // 未登录状态 - 显示登录界面
    if (!user) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
                <div className="text-center max-w-md mx-4">
                    <div className="mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                            四象限清单
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            高效的时间管理工具
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                        <div className="mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                                需要登录
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                请使用您的账户登录以继续使用
                            </p>
                        </div>

                        <AuthModal isOpen={true} onClose={() => { }} />
                    </div>

                    <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
                        没有账户？请联系管理员创建
                    </p>
                </div>
            </div>
        );
    }

    // 已登录 - 显示内容
    return <>{children}</>;
};
