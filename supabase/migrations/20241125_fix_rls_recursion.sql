-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function

-- 1. Create a secure function to check admin status (bypasses RLS)
create or replace function public.is_super_admin()
returns boolean
language plpgsql
security definer -- This is key: runs with creator's permissions
as $$
begin
    return exists (
        select 1
        from public.user_profiles
        where id = auth.uid()
        and role = 'super_admin'
        and is_active = true
    );
end;
$$;

-- 2. Drop existing problematic policies
drop policy if exists "Super admins can view all profiles" on public.user_profiles;
drop policy if exists "Super admins can update all profiles" on public.user_profiles;
drop policy if exists "Super admins can delete profiles" on public.user_profiles;

-- 3. Re-create policies using the secure function
create policy "Super admins can view all profiles"
    on public.user_profiles for select
    using (
        public.is_super_admin()
    );

create policy "Super admins can update all profiles"
    on public.user_profiles for update
    using (
        public.is_super_admin()
    );

create policy "Super admins can delete profiles"
    on public.user_profiles for delete
    using (
        public.is_super_admin()
    );

-- 4. Ensure RLS is enabled
alter table public.user_profiles enable row level security;
