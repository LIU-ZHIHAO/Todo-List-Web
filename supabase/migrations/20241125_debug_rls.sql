-- Temporarily disable RLS on user_profiles to debug permission issues
alter table public.user_profiles disable row level security;

-- Verify the user data again
select * from public.user_profiles where email = '1211574210@qq.com';
