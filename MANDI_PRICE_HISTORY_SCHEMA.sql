-- Mandi Price History Table
-- Stores historical price data for major crops
-- Run this in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS public.mandi_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  market TEXT NOT NULL,
  date DATE NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  arrival_quantity NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one record per market per commodity per day
  UNIQUE(commodity, state, district, market, date)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_mandi_history_commodity_date 
  ON public.mandi_price_history (commodity, date DESC);

CREATE INDEX IF NOT EXISTS idx_mandi_history_state_commodity 
  ON public.mandi_price_history (state, commodity, date DESC);

CREATE INDEX IF NOT EXISTS idx_mandi_history_date 
  ON public.mandi_price_history (date DESC);

CREATE INDEX IF NOT EXISTS idx_mandi_history_commodity_state_date 
  ON public.mandi_price_history (commodity, state, date DESC);

-- Enable Row Level Security
ALTER TABLE public.mandi_price_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read price history
CREATE POLICY "allow_read_mandi_history"
  ON public.mandi_price_history
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert (for testing and sync)
-- In production, you can restrict this to specific users/roles
CREATE POLICY "allow_insert_mandi_history"
  ON public.mandi_price_history
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to update (for upsert operations)
CREATE POLICY "allow_update_mandi_history"
  ON public.mandi_price_history
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Optional: Create a view for latest prices
CREATE OR REPLACE VIEW public.latest_mandi_prices AS
SELECT DISTINCT ON (commodity, state)
  commodity,
  state,
  district,
  market,
  date,
  modal_price,
  min_price,
  max_price
FROM public.mandi_price_history
ORDER BY commodity, state, date DESC;

-- Optional: Create a materialized view for price trends (refresh daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mandi_price_trends AS
WITH price_changes AS (
  SELECT 
    commodity,
    state,
    date,
    AVG(modal_price) as avg_price,
    LAG(AVG(modal_price)) OVER (PARTITION BY commodity, state ORDER BY date) as prev_price
  FROM public.mandi_price_history
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY commodity, state, date
),
latest_prices AS (
  SELECT 
    commodity,
    state,
    date,
    avg_price,
    prev_price,
    ROW_NUMBER() OVER (PARTITION BY commodity, state ORDER BY date DESC) as rn
  FROM price_changes
)
SELECT 
  commodity,
  state,
  date as latest_date,
  avg_price as current_price,
  prev_price as previous_price,
  ROUND(
    ((avg_price - prev_price) / NULLIF(prev_price, 0)) * 100, 
    2
  ) as change_percent
FROM latest_prices
WHERE rn = 1;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mandi_trends_commodity 
  ON public.mandi_price_trends (commodity);

-- Function to refresh trends (call this daily after sync)
CREATE OR REPLACE FUNCTION refresh_mandi_trends()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.mandi_price_trends;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.mandi_price_history TO authenticated;
GRANT SELECT ON public.latest_mandi_prices TO authenticated;
GRANT SELECT ON public.mandi_price_trends TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Mandi Price History schema created successfully!';
  RAISE NOTICE '📊 Tables: mandi_price_history';
  RAISE NOTICE '👁️ Views: latest_mandi_prices, mandi_price_trends';
  RAISE NOTICE '🔄 Run mandiPriceHistoryService.syncTodaysPrices() to start collecting data';
END $$;
