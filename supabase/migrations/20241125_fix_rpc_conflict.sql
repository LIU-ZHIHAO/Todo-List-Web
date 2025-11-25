-- Fix RPC function conflicts by dropping them first
-- 1. Drop existing functions to avoid parameter name conflicts
drop function if exists public.create_user_by_admin(text, text, text, text);
drop function if exists public.delete_user_by_admin(uuid);
drop function if exists public.update_password_by_admin(uuid, text);

-- 2. Enable pgcrypto
create extension if not exists pgcrypto schema extensions;

-- 3. Re-create create_user_by_admin
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
    -- Check admin
    select (role = 'super_admin' and is_active = true)
    into is_admin
    from public.user_profiles
    where id = auth.uid();

    if is_admin is not true then
        return json_build_object('success', false, 'message', 'Permission denied');
    end if;

    -- Check duplicates
    if exists (select 1 from auth.users where email = new_email) then
        return json_build_object('success', false, 'message', 'Email already exists');
    end if;
    
    if exists (select 1 from public.user_profiles where username = new_username) then
        return json_build_object('success', false, 'message', 'Username already exists');
    end if;

    new_id := gen_random_uuid();

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
        now(),
        '{"provider": "email", "providers": ["email"]}',
        json_build_object('username', new_username, 'role', new_role),
        now(),
        now(),
        '',
        '',
        false
    );

    return json_build_object('success', true, 'user_id', new_id);
exception when others then
    return json_build_object('success', false, 'message', SQLERRM);
end;
$$;

-- 4. Re-create delete_user_by_admin
create or replace function public.delete_user_by_admin(target_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    is_admin boolean;
begin
    select (role = 'super_admin' and is_active = true)
    into is_admin
    from public.user_profiles
    where id = auth.uid();

    if is_admin is not true then
        return json_build_object('success', false, 'message', 'Permission denied');
    end if;

    delete from public.user_profiles where id = target_user_id;
    delete from auth.users where id = target_user_id;

    return json_build_object('success', true);
exception when others then
    return json_build_object('success', false, 'message', SQLERRM);
end;
$$;

-- 5. Re-create update_password_by_admin
create or replace function public.update_password_by_admin(target_user_id uuid, new_password text)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    is_admin boolean;
begin
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

-- 6. Grant permissions
grant execute on function public.create_user_by_admin to authenticated;
grant execute on function public.delete_user_by_admin to authenticated;
grant execute on function public.update_password_by_admin to authenticated;
