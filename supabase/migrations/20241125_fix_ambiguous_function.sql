-- Fix ambiguous function error by being explicit
-- 1. Drop ALL existing policies first
do $$
declare
  r record;
begin
  for r in (select policyname from pg_policies where tablename = 'user_profiles') loop
    execute format('drop policy if exists %I on public.user_profiles', r.policyname);
  end loop;
end $$;

-- 2. Explicitly drop the function to clear conflicts
drop function if exists public.is_super_admin();

-- 3. Create the function
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _is_admin boolean;
begin
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

-- 4. Set owner with explicit signature
alter function public.is_super_admin() owner to postgres;

-- 5. Re-create policies
create policy "allow_read_own_profile"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "allow_read_all_profiles_if_admin"
    on public.user_profiles for select
    using (public.is_super_admin());

create policy "allow_update_all_profiles_if_admin"
    on public.user_profiles for update
    using (public.is_super_admin());

create policy "allow_delete_all_profiles_if_admin"
    on public.user_profiles for delete
    using (public.is_super_admin());

-- 6. Enable RLS and grant permissions
alter table public.user_profiles enable row level security;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_super_admin() to service_role;
