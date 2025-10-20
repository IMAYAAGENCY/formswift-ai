-- Add automation fields to affiliate_banners
ALTER TABLE affiliate_banners
ADD COLUMN IF NOT EXISTS active_from timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS active_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS auto_rotate boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS rotation_interval integer DEFAULT 5000,
ADD COLUMN IF NOT EXISTS total_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_through_rate numeric DEFAULT 0;

-- Create function to calculate CTR
CREATE OR REPLACE FUNCTION calculate_banner_ctr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_views > 0 THEN
    NEW.click_through_rate := (NEW.total_clicks::numeric / NEW.total_views::numeric) * 100;
  ELSE
    NEW.click_through_rate := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate CTR
DROP TRIGGER IF EXISTS update_banner_ctr ON affiliate_banners;
CREATE TRIGGER update_banner_ctr
  BEFORE UPDATE ON affiliate_banners
  FOR EACH ROW
  WHEN (OLD.total_clicks IS DISTINCT FROM NEW.total_clicks OR OLD.total_views IS DISTINCT FROM NEW.total_views)
  EXECUTE FUNCTION calculate_banner_ctr();

-- Create function to auto-pause low performers
CREATE OR REPLACE FUNCTION auto_pause_low_performers()
RETURNS void AS $$
BEGIN
  UPDATE affiliate_banners
  SET is_active = false
  WHERE total_views > 100 
    AND click_through_rate < 0.5 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;