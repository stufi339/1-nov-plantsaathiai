-- Field Lifecycle Management System - Database Schema
-- Add lifecycle management columns to fields table and create events table

-- 1. Add lifecycle columns to fields table
ALTER TABLE fields
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'dormant')),
ADD COLUMN IF NOT EXISTS harvest_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_crop_type TEXT,
ADD COLUMN IF NOT EXISTS reactivation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lifecycle_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create field lifecycle events table for audit trail
CREATE TABLE IF NOT EXISTS field_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'activated', 'harvest_detected', 'harvest_confirmed', 'dormant', 'reactivated')),
  from_status TEXT CHECK (from_status IN ('active', 'harvested', 'dormant')),
  to_status TEXT NOT NULL CHECK (to_status IN ('active', 'harvested', 'dormant')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fields_status ON fields(status);
CREATE INDEX IF NOT EXISTS idx_fields_harvest_date ON fields(harvest_date);
CREATE INDEX IF NOT EXISTS idx_field_lifecycle_events_field_id ON field_lifecycle_events(field_id);
CREATE INDEX IF NOT EXISTS idx_field_lifecycle_events_created_at ON field_lifecycle_events(created_at DESC);

-- 4. Add NDRE column to field_data if not exists (for harvest detection)
ALTER TABLE field_data
ADD COLUMN IF NOT EXISTS ndre DECIMAL(5,4);

-- 5. Create RLS policies for field_lifecycle_events
ALTER TABLE field_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own field lifecycle events
CREATE POLICY "Users can view own field lifecycle events"
ON field_lifecycle_events
FOR SELECT
USING (
  field_id IN (
    SELECT id FROM fields WHERE user_id = auth.uid()
  )
);

-- Users can insert lifecycle events for their own fields
CREATE POLICY "Users can insert own field lifecycle events"
ON field_lifecycle_events
FOR INSERT
WITH CHECK (
  field_id IN (
    SELECT id FROM fields WHERE user_id = auth.uid()
  )
);

-- 6. Create function to auto-log field creation event
CREATE OR REPLACE FUNCTION log_field_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO field_lifecycle_events (field_id, event_type, to_status, metadata)
  VALUES (NEW.id, 'created', 'active', jsonb_build_object('crop_type', NEW.crop_type));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for field creation
DROP TRIGGER IF EXISTS trigger_log_field_creation ON fields;
CREATE TRIGGER trigger_log_field_creation
AFTER INSERT ON fields
FOR EACH ROW
EXECUTE FUNCTION log_field_creation();

-- 8. Update existing fields to have default status
UPDATE fields
SET status = 'active'
WHERE status IS NULL;

-- 9. Create view for field lifecycle summary
CREATE OR REPLACE VIEW field_lifecycle_summary AS
SELECT 
  f.id,
  f.name,
  f.crop_type,
  f.status,
  f.harvest_date,
  f.last_crop_type,
  f.reactivation_date,
  f.lifecycle_metadata,
  (
    SELECT COUNT(*) 
    FROM field_lifecycle_events 
    WHERE field_id = f.id
  ) as total_events,
  (
    SELECT created_at 
    FROM field_lifecycle_events 
    WHERE field_id = f.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) as last_event_date
FROM fields f;

-- 10. Grant permissions
GRANT SELECT ON field_lifecycle_summary TO authenticated;

COMMENT ON TABLE field_lifecycle_events IS 'Audit trail of all field lifecycle state changes';
COMMENT ON COLUMN fields.status IS 'Current lifecycle status: active (monitoring), harvested (recently harvested), dormant (resting)';
COMMENT ON COLUMN fields.harvest_date IS 'Date when crop was harvested';
COMMENT ON COLUMN fields.last_crop_type IS 'Previous crop type for rotation analysis';
COMMENT ON COLUMN fields.lifecycle_metadata IS 'Additional lifecycle context (peak NDVI, detection dates, etc.)';
