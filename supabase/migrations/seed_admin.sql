-- Create a temporary super_admin user
-- Username: admin
-- Email: admin@antigravity.app
-- Password: adminadmin

DO $$
DECLARE
    new_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
        new_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@antigravity.app', crypt('adminadmin', gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('username', 'admin', 'role', 'super_admin'),
        now(), now(),
        '', '', '', ''
    );

    INSERT INTO public.user_profiles (id, email, username, role, is_active)
    VALUES (new_id, 'admin@antigravity.app', 'admin', 'super_admin', true);
END $$;
