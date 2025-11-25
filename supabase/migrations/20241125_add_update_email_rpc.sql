-- update_email_by_admin
CREATE OR REPLACE FUNCTION update_email_by_admin(target_user_id UUID, new_email TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Check if admin
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
        RETURN json_build_object('success', false, 'message', 'Permission denied');
    END IF;

    -- Update auth.users
    UPDATE auth.users
    SET email = new_email,
        email_confirmed_at = now(),
        updated_at = now()
    WHERE id = target_user_id;

    -- Update public.user_profiles
    UPDATE public.user_profiles
    SET email = new_email,
        updated_at = now()
    WHERE id = target_user_id;

    RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.update_email_by_admin(UUID, TEXT) TO authenticated, service_role;
