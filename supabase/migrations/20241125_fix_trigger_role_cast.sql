-- Fix type mismatch in handle_new_user trigger
-- The error "column role is of type user_role but expression is of type text" happens in the trigger
-- because we are extracting text from JSON and trying to insert it into an Enum column without casting.

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
        -- Explicitly cast the text to user_role enum
        coalesce(new.raw_user_meta_data->>'role', 'user')::public.user_role,
        now(),
        now(),
        true,
        new.raw_user_meta_data->>'username'
    );
    return new;
end;
$$;
