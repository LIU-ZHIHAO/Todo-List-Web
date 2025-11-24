import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'user';

export interface UserProfile {
    id: string;
    email: string;
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
     * 用户注册（仅供超级管理员使用）
     */
    async signUp(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
            }
        });

        return {
            user: data.user,
            error: error as AuthError | null
        };
    },

    /**
     * 管理员创建用户
     */
    async createUserByAdmin(email: string, password: string, role: UserRole = 'user'): Promise<{ success: boolean; error: any }> {
        try {
            // 使用 Supabase Admin API 创建用户
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // 自动确认邮箱
            });

            if (error) throw error;

            // 更新用户角色
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update({
                        role,
                        created_by: (await this.getCurrentUser())?.id
                    })
                    .eq('id', data.user.id);

                if (profileError) throw profileError;
            }

            return { success: true, error: null };
        } catch (error) {
            return { success: false, error };
        }
    },

    /**
     * 用户登录
     */
    async signIn(email: string, password: string): Promise<AuthResponse> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

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
            // 删除用户配置
            const { error: profileError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', userId);

            if (profileError) throw profileError;

            // 删除认证用户
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) throw authError;

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
     * 重置密码请求
     */
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error as AuthError | null };
    },

    /**
     * 更新密码
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
