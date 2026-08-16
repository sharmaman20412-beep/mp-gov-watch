
REVOKE EXECUTE ON FUNCTION public.run_escalations() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_overdue_works() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_work_changes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prepare_complaint() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_official(uuid) FROM anon;
