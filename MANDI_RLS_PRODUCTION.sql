-- Production RLS Policies for Mandi Price History
-- Use this AFTER testing is complete for better security

-- Drop permissive test policies
DROP POLICY IF EXISTS "allow_insert_mandi_history" ON public.mandi_price_history;
DROP POLICY IF EXISTS "allow_update_mandi_history" ON public.mandi_price_history;
DROP POLICY IF EXISTS "allow_read_mandi_history" ON public.mandi_price_history;

-- ============================================
-- PRODUCTION POLICIES (More Secure)
-- ============================================

-- 1. Everyone can READ price history
CREATE POLICY "public_read_mandi_history"
  ON public.mandi_price_history
  FOR SELECT
  USING (true);

-- 2. Only authenticated users can INSERT
-- (Your app users when logged in)
CREATE POLICY "authenticated_insert_mandi_history"
  ON public.mandi_price_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Only authenticated users can UPDATE
-- (Needed for upsert operations)
CREATE POLICY "authenticated_update_mandi_history"
  ON public.mandi_price_history
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Optional: Create a service role for backend sync
-- If you want a dedicated sync service, create a custom role:
/*
CREATE ROLE mandi_sync_service;
GRANT INSERT, UPDATE ON public.mandi_price_history TO mandi_sync_service;

CREATE POLICY "service_sync_mandi_history"
  ON public.mandi_price_history
  FOR ALL
  TO mandi_sync_service
  USING (true)
  WITH CHECK (true);
*/

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'mandi_price_history'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Production RLS policies applied!';
  RAISE NOTICE '📖 Public can READ';
  RAISE NOTICE '🔐 Only authenticated users can INSERT/UPDATE';
  RAISE NOTICE '🛡️ Better security for production use';
END $$;
