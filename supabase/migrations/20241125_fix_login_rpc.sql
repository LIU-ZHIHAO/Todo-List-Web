-- Fix get_email_by_username permissions and search_path
-- The error "Database error querying schema" usually happens when the anon role
-- doesn't have permission to execute the RPC function during login.

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

-- Grant permissions to anon (CRITICAL for login page) and authenticated
grant execute on function public.get_email_by_username(text) to anon;
grant execute on function public.get_email_by_username(text) to authenticated;
grant execute on function public.get_email_by_username(text) to service_role;
