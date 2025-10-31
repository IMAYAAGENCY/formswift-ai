-- Fix search_path for security on database functions
-- Handle trigger functions correctly

-- Fix auto_pause_low_performers function
DROP FUNCTION IF EXISTS public.auto_pause_low_performers() CASCADE;
CREATE FUNCTION public.auto_pause_low_performers()
RETURNS void AS $$
BEGIN
  UPDATE public.affiliates
  SET status = 'paused'
  WHERE status = 'active'
  AND (total_sales / NULLIF(total_clicks, 0)::numeric) < 0.01
  AND total_clicks > 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix calculate_banner_ctr function (trigger function - must return TRIGGER)
DROP FUNCTION IF EXISTS public.calculate_banner_ctr() CASCADE;
CREATE FUNCTION public.calculate_banner_ctr()
RETURNS trigger AS $$
BEGIN
  NEW.ctr = CASE 
    WHEN NEW.total_views > 0 THEN (NEW.total_clicks::numeric / NEW.total_views::numeric) * 100
    ELSE 0
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger with correct WHEN condition
CREATE TRIGGER update_banner_ctr
BEFORE UPDATE ON public.affiliate_banners
FOR EACH ROW
WHEN ((old.total_clicks IS DISTINCT FROM new.total_clicks) OR (old.total_views IS DISTINCT FROM new.total_views))
EXECUTE FUNCTION public.calculate_banner_ctr();

-- Fix generate_referral_code function
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
CREATE FUNCTION public.generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_affiliate_banner_timestamp function (trigger function)
DROP FUNCTION IF EXISTS public.update_affiliate_banner_timestamp() CASCADE;
CREATE FUNCTION public.update_affiliate_banner_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate its trigger
CREATE TRIGGER update_affiliate_banners_timestamp
BEFORE UPDATE ON public.affiliate_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_affiliate_banner_timestamp();