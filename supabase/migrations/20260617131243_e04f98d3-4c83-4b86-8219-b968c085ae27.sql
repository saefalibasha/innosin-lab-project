GRANT EXECUTE ON FUNCTION public.is_admin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO anon, authenticated;