-- Nuclear option to fix RLS recursion
-- 1. Drop ALL existing policies on user_profiles to ensure no conflicts
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where tablename = 'user_profiles') loop
    execute format('drop policy if exists %I on public.user_profiles', r.policyname);
  end loop;
end $$;

-- 2. Create the security definer function with explicit search_path and owner
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public -- Best practice for security definer
as $$
declare
  _is_admin boolean;
begin
  -- Avoid query if no user is logged in
  if auth.uid() is null then
    return false;
  end if;
  
  select (role = 'super_admin' and is_active = true)
  into _is_admin
  from public.user_profiles
  where id = auth.uid();
  
  return coalesce(_is_admin, false);
end;
$$;

-- Attempt to set owner to postgres (might fail if not superuser, but usually works in dashboard)
-- If this fails, the script continues. The creator usually has enough privs.
alter function public.is_super_admin() owner to postgres;

-- 3. Re-create the policies
-- Policy for users to view their own profile
create policy "allow_read_own_profile"
    on public.user_profiles for select
    using (auth.uid() = id);

-- Policy for super admins to view all profiles
create policy "allow_read_all_profiles_if_admin"
    on public.user_profiles for select
    using (public.is_super_admin());

-- Policy for super admins to update all profiles
create policy "allow_update_all_profiles_if_admin"
    on public.user_profiles for update
    using (public.is_super_admin());

-- Policy for super admins to delete profiles
create policy "allow_delete_all_profiles_if_admin"
    on public.user_profiles for delete
    using (public.is_super_admin());

-- 4. Ensure RLS is enabled
alter table public.user_profiles enable row level security;

-- 5. Grant execute permission to authenticated users
grant execute on function public.is_super_admin to authenticated;
grant execute on function public.is_super_admin to service_role;
