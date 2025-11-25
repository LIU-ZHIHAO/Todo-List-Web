-- Fix admin status for specific user
-- 1. Ensure is_active column exists
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'user_profiles' and column_name = 'is_active') then
        alter table public.user_profiles add column is_active boolean default true;
    end if;
end $$;

-- 2. Force update the user to be super_admin and active
update public.user_profiles
set 
    role = 'super_admin',
    is_active = true
where email = '1211574210@qq.com';

-- 3. Verify RLS policies (Re-run just to be safe)
alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

drop policy if exists "Super admins can view all profiles" on public.user_profiles;
create policy "Super admins can view all profiles"
    on public.user_profiles for select
    using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role = 'super_admin' and is_active = true
        )
    );

-- 4. Ensure the user exists in user_profiles if not present (Edge case)
insert into public.user_profiles (id, email, role, is_active, created_at, updated_at)
select id, email, 'super_admin', true, now(), now()
from auth.users
where email = '1211574210@qq.com'
on conflict (id) do nothing;
