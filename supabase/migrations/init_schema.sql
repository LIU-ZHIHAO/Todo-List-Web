-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'super_admin')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subtasks JSONB DEFAULT '[]'::jsonb,
    date TEXT,
    quadrant INTEGER,
    tag TEXT,
    completed TEXT,
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    "order" INTEGER,
    is_overdue BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

CREATE TABLE IF NOT EXISTS public.quick_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tags JSONB DEFAULT '[]'::jsonb,
    linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    is_starred BOOLEAN DEFAULT FALSE,
    color TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- 3. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- 4. Helper Functions for RLS
-- is_super_admin (Helper for RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;

-- 5. RLS Policies

-- user_profiles policies
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.user_profiles
    FOR ALL USING (
        public.is_super_admin()
    );

-- tasks policies
CREATE POLICY "Users can CRUD own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- quick_notes policies
CREATE POLICY "Users can CRUD own notes" ON public.quick_notes
    FOR ALL USING (auth.uid() = user_id);

-- 6. RPC Functions

-- create_user_by_admin
CREATE OR REPLACE FUNCTION create_user_by_admin(
    new_email TEXT,
    new_password TEXT,
    new_username TEXT,
    new_role TEXT
) RETURNS JSON
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if admin
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
        RETURN json_build_object('success', false, 'message', 'Permission denied');
    END IF;

    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
        new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        new_email, crypt(new_password, gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('username', new_username, 'role', new_role),
        now(), now(),
        '', '', '', ''
    );

    INSERT INTO public.user_profiles (id, email, username, role, is_active)
    VALUES (new_user_id, new_email, new_username, new_role, true);

    RETURN json_build_object('success', true, 'user_id', new_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- get_email_by_username
CREATE OR REPLACE FUNCTION get_email_by_username(username_input TEXT)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    found_email TEXT;
BEGIN
    SELECT email INTO found_email
    FROM public.user_profiles
    WHERE username = username_input
    LIMIT 1;
    RETURN found_email;
END;
$$ LANGUAGE plpgsql;

-- delete_user_by_admin
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
        RETURN json_build_object('success', false, 'message', 'Permission denied');
    END IF;

    DELETE FROM auth.users WHERE id = target_user_id;
    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- update_password_by_admin
CREATE OR REPLACE FUNCTION update_password_by_admin(target_user_id UUID, new_password TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
        RETURN json_build_object('success', false, 'message', 'Permission denied');
    END IF;

    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = target_user_id;

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS on_tasks_updated ON public.tasks;
CREATE TRIGGER on_tasks_updated BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS on_quick_notes_updated ON public.quick_notes;
CREATE TRIGGER on_quick_notes_updated BEFORE UPDATE ON public.quick_notes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 8. Grant Permissions (CRITICAL)
-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to tables
GRANT ALL ON TABLE public.user_profiles TO service_role;
GRANT SELECT ON TABLE public.user_profiles TO anon, authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.quick_notes TO service_role;
GRANT ALL ON TABLE public.quick_notes TO authenticated;

-- Grant execute on RPC functions
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_by_admin(TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_password_by_admin(UUID, TEXT) TO authenticated, service_role;

-- Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
