import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

/**
 * 调试组件 - 显示认证状态
 * 用于排查权限问题
 */
export const AuthDebugPanel: React.FC = () => {
    const { user, userProfile, isSuperAdmin, loading } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        const loadDebugInfo = async () => {
            if (user) {
                const profile = await authService.getUserProfile();
                setDebugInfo({
                    userId: user.id,
                    userEmail: user.email,
                    profileData: profile,
                    isSuperAdminComputed: profile?.role === 'super_admin' && profile?.is_active === true,
                    contextIsSuperAdmin: isSuperAdmin,
                    contextUserProfile: userProfile
                });
            }
        };
        loadDebugInfo();
    }, [user, userProfile, isSuperAdmin]);

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono">
            <div className="font-bold mb-2 text-yellow-400">🔍 认证调试信息</div>

            <div className="space-y-1">
                <div>Loading: {loading ? '✅ Yes' : '❌ No'}</div>
                <div>User Email: {user?.email || 'null'}</div>
                <div>User ID: {user?.id?.substring(0, 8)}...</div>

                <div className="border-t border-gray-600 my-2 pt-2">
                    <div className="text-yellow-400">Context State:</div>
                    <div>isSuperAdmin: {isSuperAdmin ? '✅ TRUE' : '❌ FALSE'}</div>
                    <div>userProfile.role: {userProfile?.role || 'null'}</div>
                    <div>userProfile.is_active: {userProfile?.is_active ? '✅ true' : '❌ false'}</div>
                </div>

                {debugInfo && (
                    <div className="border-t border-gray-600 my-2 pt-2">
                        <div className="text-yellow-400">Direct Query:</div>
                        <div>profile.role: {debugInfo.profileData?.role || 'null'}</div>
                        <div>profile.is_active: {debugInfo.profileData?.is_active ? '✅ true' : '❌ false'}</div>
                        <div>Computed isSuperAdmin: {debugInfo.isSuperAdminComputed ? '✅ TRUE' : '❌ FALSE'}</div>
                    </div>
                )}

                <div className="border-t border-gray-600 my-2 pt-2 text-xs">
                    <div className="text-yellow-400">Expected:</div>
                    <div>• isSuperAdmin should be TRUE</div>
                    <div>• role should be 'super_admin'</div>
                    <div>• is_active should be true</div>
                </div>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
                刷新页面
            </button>
        </div>
    );
};
