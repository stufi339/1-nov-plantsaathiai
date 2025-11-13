-- PWA Push Notifications - Supabase Setup
-- Run this in your Supabase SQL Editor

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at 
  ON push_subscriptions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON push_subscriptions;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- Create notification preferences table (optional)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weather_alerts BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT true,
  crop_reminders BOOLEAN DEFAULT true,
  field_alerts BOOLEAN DEFAULT true,
  disease_alerts BOOLEAN DEFAULT true,
  daily_tips BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for notification preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to initialize notification preferences
CREATE OR REPLACE FUNCTION initialize_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize preferences on user signup
DROP TRIGGER IF EXISTS init_notification_preferences ON auth.users;
CREATE TRIGGER init_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_notification_preferences();

-- Create view for active subscriptions
CREATE OR REPLACE VIEW active_push_subscriptions AS
SELECT 
  ps.*,
  u.email,
  np.weather_alerts,
  np.price_alerts,
  np.crop_reminders,
  np.field_alerts,
  np.disease_alerts,
  np.daily_tips
FROM push_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
LEFT JOIN notification_preferences np ON ps.user_id = np.user_id
WHERE ps.last_used_at > NOW() - INTERVAL '60 days';

-- Grant access to the view
GRANT SELECT ON active_push_subscriptions TO authenticated;

-- Create function to clean up old subscriptions
CREATE OR REPLACE FUNCTION cleanup_old_push_subscriptions()
RETURNS void AS $$
BEGIN
  DELETE FROM push_subscriptions
  WHERE last_used_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to send notification (placeholder for backend)
CREATE OR REPLACE FUNCTION send_push_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription JSONB;
BEGIN
  -- Get user's push subscription
  SELECT subscription INTO v_subscription
  FROM push_subscriptions
  WHERE user_id = p_user_id
  AND last_used_at > NOW() - INTERVAL '60 days';

  IF v_subscription IS NULL THEN
    RETURN FALSE;
  END IF;

  -- In production, this would call your push notification service
  -- For now, just log the notification
  RAISE NOTICE 'Push notification: % - % (User: %)', p_title, p_body, p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create notification log table (optional, for tracking)
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for notification log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Policy for notification log
CREATE POLICY "Users can view own notification log"
  ON notification_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for notification log
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id 
  ON notification_log(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at 
  ON notification_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_log_type 
  ON notification_log(notification_type);

-- Insert sample notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ PWA Push Notification tables created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - push_subscriptions';
  RAISE NOTICE '  - notification_preferences';
  RAISE NOTICE '  - notification_log';
  RAISE NOTICE '';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - active_push_subscriptions';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - cleanup_old_push_subscriptions()';
  RAISE NOTICE '  - send_push_notification()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Generate VAPID keys: npx web-push generate-vapid-keys';
  RAISE NOTICE '  2. Add VITE_VAPID_PUBLIC_KEY to .env';
  RAISE NOTICE '  3. Test push notifications in your app';
END $$;
