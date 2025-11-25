import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, UserProfile } from '../services/auth';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    userProfile: UserProfile | null;
    isSuperAdmin: boolean;
    loading: boolean;
    signIn: (identifier: string, password: string) => Promise<{ user: User | null; error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        if (user) {
            try {
                const profile = await authService.getUserProfile();
                console.log('[Auth] Fetched profile:', profile);

                setUserProfile(profile);

                const isAdmin = profile?.role === 'super_admin' && profile?.is_active === true;
                console.log('[Auth] Is Super Admin:', isAdmin, { role: profile?.role, isActive: profile?.is_active });

                setIsSuperAdmin(isAdmin);
            } catch (err) {
                console.error('[Auth] Error refreshing profile:', err);
                setUserProfile(null);
                setIsSuperAdmin(false);
            }
        } else {
            setUserProfile(null);
            setIsSuperAdmin(false);
        }
    };

    useEffect(() => {
        // 检查当前会话
        authService.getSession().then(async (session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await refreshProfile();
            }

            setLoading(false);
        });

        // 监听认证状态变化
        const { data: { subscription } } = authService.onAuthStateChange(async (user, session) => {
            setUser(user);
            setSession(session);

            if (user) {
                await refreshProfile();
            } else {
                setUserProfile(null);
                setIsSuperAdmin(false);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 当用户变化时刷新配置
    useEffect(() => {
        if (user) {
            refreshProfile();
        }
    }, [user]);

    const signIn = async (identifier: string, password: string) => {
        const { user, error } = await authService.signIn(identifier, password);
        if (user) {
            await refreshProfile();
        }
        return { user, error };
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setIsSuperAdmin(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            userProfile,
            isSuperAdmin,
            loading,
            signIn,
            signOut,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
