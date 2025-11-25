-- Function to cleanup system and fix admin permissions
-- Usage: select cleanup_system('your_email@example.com');

create or replace function public.cleanup_system(target_email text)
returns void
language plpgsql
security definer
as $$
declare
    target_id uuid;
begin
    -- 1. Get the target user ID
    select id into target_id from auth.users where email = target_email;
    
    if target_id is null then
        raise exception 'User % not found', target_email;
    end if;

    -- 2. Ensure target user is super_admin in user_profiles
    -- This fixes the issue where the admin cannot see the management menu
    insert into public.user_profiles (id, email, role, is_active, created_at, updated_at)
    values (target_id, target_email, 'super_admin', true, now(), now())
    on conflict (id) do update
    set role = 'super_admin',
        is_active = true,
        updated_at = now();

    -- 3. Delete other users from user_profiles
    delete from public.user_profiles where id != target_id;

    -- 4. Delete other users from auth.users
    -- We attempt to clean up related tables first to avoid Foreign Key violations
    
    -- Try to delete from tasks if it exists
    begin
        if exists (select 1 from information_schema.columns where table_name = 'tasks' and column_name = 'user_id') then
            execute 'delete from public.tasks where user_id != $1' using target_id;
        end if;
    exception when others then
        raise notice 'Error cleaning tasks: %', SQLERRM;
    end;

    -- Try to delete from quick_notes if it exists
    begin
        if exists (select 1 from information_schema.columns where table_name = 'quick_notes' and column_name = 'user_id') then
            execute 'delete from public.quick_notes where user_id != $1' using target_id;
        end if;
    exception when others then
        raise notice 'Error cleaning quick_notes: %', SQLERRM;
    end;

    -- Finally delete from auth.users
    delete from auth.users where id != target_id;
    
    raise notice 'Cleanup complete. User % is now the only user and is super_admin.', target_email;
end;
$$;
