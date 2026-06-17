-- Replace permissive INSERT policies on rate_limit_log with a stricter one
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rate_limit_log' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rate_limit_log', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Rate limit inserts must match caller identity"
ON public.rate_limit_log
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);