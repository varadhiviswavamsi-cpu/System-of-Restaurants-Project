
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- handle_new_user is only called by an auth trigger — remove PUBLIC exec.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- set_updated_at is only used by triggers — remove PUBLIC exec.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
