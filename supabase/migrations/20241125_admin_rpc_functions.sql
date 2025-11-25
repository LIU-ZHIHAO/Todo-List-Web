-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto schema extensions;

-- Function to create user by admin (bypassing client restrictions)
create or replace function public.create_user_by_admin(
    new_email text,
    new_password text,
    new_username text,
    new_role text
)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    new_id uuid;
    is_admin boolean;
begin
    -- 1. Check if caller is super_admin
    select (role = 'super_admin' and is_active = true)
    into is_admin
    from public.user_profiles
    where id = auth.uid();

    if is_admin is not true then
        return json_build_object('success', false, 'message', 'Permission denied');
    end if;

    -- 2. Check if email or username exists
    if exists (select 1 from auth.users where email = new_email) then
        return json_build_object('success', false, 'message', 'Email already exists');
    end if;
    
    if exists (select 1 from public.user_profiles where username = new_username) then
        return json_build_object('success', false, 'message', 'Username already exists');
    end if;

    -- 3. Generate UUID
    new_id := gen_random_uuid();

    -- 4. Insert into auth.users
    insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        is_sso_user
    ) values (
        '00000000-0000-0000-0000-000000000000',
        new_id,
        'authenticated',
        'authenticated',
        new_email,
        crypt(new_password, gen_salt('bf')),
        now(), -- Auto confirm
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('username', new_username, 'role', new_role),
        now(),
        now(),
        '',
        '',
        false
    );

    -- 5. Trigger should handle user_profiles creation, but we can verify or update
    -- The trigger 'on_auth_user_created' calls 'handle_new_user'
    
    return json_build_object('success', true, 'user_id', new_id);
exception when others then
    return json_build_object('success', false, 'message', SQLERRM);
end;
$$;

-- Function to delete user by admin
create or replace function public.delete_user_by_admin(target_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    is_admin boolean;
begin
    -- Check admin
    select (role = 'super_admin' and is_active = true)
    into is_admin
    from public.user_profiles
    where id = auth.uid();

    if is_admin is not true then
        return json_build_object('success', false, 'message', 'Permission denied');
    end if;

    -- Delete from public tables first (optional if cascade is set, but good for safety)
    delete from public.user_profiles where id = target_user_id;
    
    -- Delete from auth.users
    delete from auth.users where id = target_user_id;

    return json_build_object('success', true);
exception when others then
    return json_build_object('success', false, 'message', SQLERRM);
end;
$$;

-- Function to update password by admin
create or replace function public.update_password_by_admin(target_user_id uuid, new_password text)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    is_admin boolean;
begin
    -- Check admin
    select (role = 'super_admin' and is_active = true)
    into is_admin
    from public.user_profiles
    where id = auth.uid();

    if is_admin is not true then
        return json_build_object('success', false, 'message', 'Permission denied');
    end if;

    update auth.users
    set encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = now()
    where id = target_user_id;

    return json_build_object('success', true);
exception when others then
    return json_build_object('success', false, 'message', SQLERRM);
end;
$$;

-- Grant execute permissions
grant execute on function public.create_user_by_admin to authenticated;
grant execute on function public.delete_user_by_admin to authenticated;
grant execute on function public.update_password_by_admin to authenticated;
