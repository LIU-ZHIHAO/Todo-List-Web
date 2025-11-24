import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, User as UserIcon, Trash2, Power, PowerOff, Loader2, AlertCircle, CheckCircle2, Mail, Lock, X } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { authService, UserProfile } from '../../core/services/auth';

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
    const { isSuperAdmin, refreshProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 创建用户表单
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'user' | 'super_admin'>('user');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (isOpen && isSuperAdmin) {
            loadUsers();
        }
    }, [isOpen, isSuperAdmin]);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const userList = await authService.getAllUsers();
            setUsers(userList);
        } catch (err: any) {
            setError('加载用户列表失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        setSuccess(null);

        try {
            const { success: createSuccess, error: createError } = await authService.createUserByAdmin(
                newUserEmail,
                newUserPassword,
                newUserRole
            );

            if (createSuccess) {
                setSuccess(`用户 ${newUserEmail} 创建成功！`);
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserRole('user');
                setShowCreateForm(false);
                await loadUsers();
            } else {
                setError(createError?.message || '创建用户失败');
            }
        } catch (err: any) {
            setError(err.message || '创建用户失败');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        setError(null);
        setSuccess(null);

        try {
            const { success: toggleSuccess } = await authService.toggleUserStatus(userId, !currentStatus);

            if (toggleSuccess) {
                setSuccess(`用户状态已${!currentStatus ? '启用' : '停用'}`);
                await loadUsers();
            } else {
                setError('更新用户状态失败');
            }
        } catch (err: any) {
            setError(err.message || '更新用户状态失败');
        }
    };

    const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'super_admin') => {
        setError(null);
        setSuccess(null);

        const newRole = currentRole === 'user' ? 'super_admin' : 'user';

        try {
            const { success: updateSuccess } = await authService.updateUserRole(userId, newRole);

            if (updateSuccess) {
                setSuccess(`用户角色已更新为 ${newRole === 'super_admin' ? '超级管理员' : '普通用户'}`);
                await loadUsers();
                await refreshProfile();
            } else {
                setError('更新用户角色失败');
            }
        } catch (err: any) {
            setError(err.message || '更新用户角色失败');
        }
    };

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (!confirm(`确定要删除用户 ${userEmail} 吗？此操作不可恢复！`)) {
            return;
        }

        setError(null);
        setSuccess(null);

        try {
            const { success: deleteSuccess } = await authService.deleteUser(userId);

            if (deleteSuccess) {
                setSuccess(`用户 ${userEmail} 已删除`);
                await loadUsers();
            } else {
                setError('删除用户失败');
            }
        } catch (err: any) {
            setError(err.message || '删除用户失败');
        }
    };

    if (!isOpen) return null;

    if (!isSuperAdmin) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                    <div className="text-center">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">权限不足</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">只有超级管理员可以访问用户管理</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users size={28} />
                        <div>
                            <h2 className="text-2xl font-bold">用户管理</h2>
                            <p className="text-sm text-purple-100">管理系统用户和权限</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-2">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                            <CheckCircle2 size={16} className="flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-4">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        <UserPlus size={18} />
                        <span>{showCreateForm ? '取消创建' : '创建新用户'}</span>
                    </button>
                </div>

                {/* Create User Form */}
                {showCreateForm && (
                    <div className="px-6 pb-4">
                        <form onSubmit={handleCreateUser} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white">创建新用户</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    邮箱地址
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    密码
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="至少6位"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    用户角色
                                </label>
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'super_admin')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="user">普通用户</option>
                                    <option value="super_admin">超级管理员</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>创建中...</span>
                                    </>
                                ) : (
                                    <span>创建用户</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* User List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>暂无用户</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                {user.role === 'super_admin' ? (
                                                    <Shield size={18} className="text-purple-500 flex-shrink-0" />
                                                ) : (
                                                    <UserIcon size={18} className="text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {user.email}
                                                </span>
                                                {!user.is_active && (
                                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded">
                                                        已停用
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>角色: {user.role === 'super_admin' ? '超级管理员' : '普通用户'}</span>
                                                <span>创建于: {new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleUserRole(user.id, user.role)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title={user.role === 'user' ? '设为管理员' : '设为普通用户'}
                                            >
                                                <Shield size={16} className={user.role === 'super_admin' ? 'text-purple-500' : 'text-gray-400'} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title={user.is_active ? '停用用户' : '启用用户'}
                                            >
                                                {user.is_active ? (
                                                    <Power size={16} className="text-green-500" />
                                                ) : (
                                                    <PowerOff size={16} className="text-red-500" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="删除用户"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>共 {users.length} 个用户</span>
                        <button
                            onClick={loadUsers}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Loader2 size={14} />
                            <span>刷新</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
