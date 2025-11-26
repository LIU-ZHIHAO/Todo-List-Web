import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'user';

export interface UserProfile {
    id: string;
    email: string;
    username?: string;
    role: UserRole;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface AuthResponse {
    user: User | null;
    error: AuthError | null;
}

export const authService = {
    /**
     * 管理员创建用户
     */
    async createUserByAdmin(email: string, password: string, username: string, role: UserRole = 'user'): Promise<{ success: boolean; error: any }> {
        try {
            const { data, error } = await supabase.rpc('create_user_by_admin', {
                new_email: email,
                new_password: password,
                new_username: username,
                new_role: role
            });

            if (error) throw error;
            if (!data || !data.success) {
                throw new Error(data?.message || '创建用户失败');
            }

            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * 用户登录 (支持邮箱或用户名)
     */
    async signIn(identifier: string, password: string): Promise<AuthResponse> {
        let email = identifier;

        // 如果不是邮箱格式，尝试通过用户名查找邮箱
        if (!identifier.includes('@')) {
            const { data, error } = await supabase.rpc('get_email_by_username', {
                username_input: identifier
            });

            if (error || !data) {
                return {
                    user: null,
                    error: { message: '用户名不存在或密码错误' } as AuthError
                };
            }
            email = data;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // 检查用户是否被停用
        if (data.user) {
            const profile = await this.getUserProfile(data.user.id);
            if (profile && !profile.is_active) {
                await this.signOut();
                return {
                    user: null,
                    error: { message: '账户已被停用，请联系管理员' } as AuthError
                };
            }
        }

        return {
            user: data.user,
            error: error as AuthError | null
        };
    },

    /**
     * 用户登出
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.signOut();
        return { error: error as AuthError | null };
    },

    /**
     * 获取当前用户
     */
    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * 获取当前会话
     */
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    /**
     * 获取当前用户配置（包含角色）
     */
    async getUserProfile(userId?: string): Promise<UserProfile | null> {
        const uid = userId || (await this.getCurrentUser())?.id;
        if (!uid) return null;

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    },

    /**
     * 检查是否是超级管理员
     */
    async isSuperAdmin(): Promise<boolean> {
        const profile = await this.getUserProfile();
        return profile?.role === 'super_admin' && profile?.is_active === true;
    },

    /**
     * 获取所有用户（仅超级管理员）
     */
    async getAllUsers(): Promise<UserProfile[]> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return data || [];
    },

    /**
     * 更新用户角色（仅超级管理员）
     */
    async updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error: any }> {
        const { error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('id', userId);

        return {
            success: !error,
            error
        };
    },

    /**
     * 停用/启用用户（仅超级管理员）
     */
    async toggleUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error: any }> {
        const { error } = await supabase
            .from('user_profiles')
            .update({ is_active: isActive })
            .eq('id', userId);

        return {
            success: !error,
            error
        };
    },

    /**
     * 删除用户（仅超级管理员）
     */
    async deleteUser(userId: string): Promise<{ success: boolean; error: any }> {
        try {
            const { data, error } = await supabase.rpc('delete_user_by_admin', {
                target_user_id: userId
            });

            if (error) throw error;
            if (!data || !data.success) {
                throw new Error(data?.message || '删除用户失败');
            }

            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * 管理员修改用户密码
     */
    async adminUpdateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; error: any }> {
        try {
            const { data, error } = await supabase.rpc('update_password_by_admin', {
                target_user_id: userId,
                new_password: newPassword
            });

            if (error) throw error;
            if (!data || !data.success) {
                throw new Error(data?.message || '更新密码失败');
            }

            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * 管理员修改用户邮箱
     */
    async adminUpdateUserEmail(userId: string, newEmail: string): Promise<{ success: boolean; error: any }> {
        try {
            const { data, error } = await supabase.rpc('update_email_by_admin', {
                target_user_id: userId,
                new_email: newEmail
            });

            if (error) throw error;
            if (!data || !data.success) {
                throw new Error(data?.message || '更新邮箱失败');
            }

            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * 监听认证状态变化
     */
    onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user ?? null, session);
        });
    },

    /**
     * 重置密码请求 (发送邮件)
     */
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error as AuthError | null };
    },

    /**
     * 更新密码 (当前用户)
     */
    async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { error: error as AuthError | null };
    },

    /**
     * 更新用户信息
     */
    async updateUser(data: { email?: string; password?: string; data?: object }): Promise<AuthResponse> {
        const { data: userData, error } = await supabase.auth.updateUser(data);
        return {
            user: userData.user,
            error: error as AuthError | null
        };
    }
};
