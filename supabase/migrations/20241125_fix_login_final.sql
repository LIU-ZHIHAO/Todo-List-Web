-- Fix "Database error querying schema" by reloading schema cache and ensuring function correctness

-- 1. Notify PostgREST to reload schema cache (Fixes stale cache issues)
NOTIFY pgrst, 'reload config';

-- 2. Drop and Recreate the function with explicit owner and permissions
drop function if exists public.get_email_by_username(text);

create or replace function public.get_email_by_username(username_input text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    found_email text;
begin
    select email into found_email
    from public.user_profiles
    where username = username_input;
    return found_email;
end;
$$;

-- 3. Set owner to postgres (Ensure it has permissions to bypass RLS)
alter function public.get_email_by_username(text) owner to postgres;

-- 4. Grant execute permissions explicitly
grant execute on function public.get_email_by_username(text) to anon;
grant execute on function public.get_email_by_username(text) to authenticated;
grant execute on function public.get_email_by_username(text) to service_role;

-- 5. Ensure username column is indexed for performance
create index if not exists idx_user_profiles_username on public.user_profiles(username);

-- 6. Verify the function works (for debugging in SQL Editor)
-- You can run this line separately to test:
-- select public.get_email_by_username('123');
