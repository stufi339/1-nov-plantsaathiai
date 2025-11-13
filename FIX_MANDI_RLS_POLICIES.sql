-- Fix RLS Policies for Mandi Price History
-- Run this in Supabase SQL Editor to allow data insertion

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "allow_insert_mandi_history" ON public.mandi_price_history;
DROP POLICY IF EXISTS "allow_update_mandi_history" ON public.mandi_price_history;

-- Create permissive policies for testing and sync
-- Policy: Allow anyone to insert
CREATE POLICY "allow_insert_mandi_history"
  ON public.mandi_price_history
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to update (needed for upsert)
CREATE POLICY "allow_update_mandi_history"
  ON public.mandi_price_history
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'mandi_price_history';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated successfully!';
  RAISE NOTICE '📝 Policies now allow INSERT and UPDATE operations';
  RAISE NOTICE '🔄 You can now run the sync test again';
END $$;
