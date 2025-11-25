-- Enable RLS
alter table public.user_profiles enable row level security;

-- Add username column if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'user_profiles' and column_name = 'username') then
        alter table public.user_profiles add column username text unique;
    end if;
end $$;

-- Create or replace function to get email by username (security definer to bypass RLS)
create or replace function public.get_email_by_username(username_input text)
returns text
language plpgsql
security definer
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

-- Policies
-- Allow users to view their own profile
create policy "Users can view own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

-- Allow super_admin to view all profiles
create policy "Super admins can view all profiles"
    on public.user_profiles for select
    using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );

-- Allow super_admin to update all profiles
create policy "Super admins can update all profiles"
    on public.user_profiles for update
    using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );

-- Allow super_admin to delete profiles
create policy "Super admins can delete profiles"
    on public.user_profiles for delete
    using (
        exists (
            select 1 from public.user_profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );

-- Trigger to create profile on signup (if used) or admin create
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
    insert into public.user_profiles (id, email, role, created_at, updated_at, is_active, username)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'role', 'user'),
        now(),
        now(),
        true,
        new.raw_user_meta_data->>'username'
    );
    return new;
end;
$$;

-- Drop trigger if exists to avoid duplication error on create
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
