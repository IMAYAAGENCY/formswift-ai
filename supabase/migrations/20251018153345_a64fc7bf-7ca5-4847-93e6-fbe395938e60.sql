-- Create table for tracking affiliate/referral codes
CREATE TABLE public.affiliate_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  is_affiliate boolean NOT NULL DEFAULT false,
  commission_rate numeric NOT NULL DEFAULT 10,
  total_clicks integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for tracking referral conversions
CREATE TABLE public.referral_conversions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  referral_code text NOT NULL,
  payment_id text,
  payment_amount numeric,
  commission_amount numeric,
  status text NOT NULL DEFAULT 'pending',
  converted_at timestamp with time zone NOT NULL DEFAULT now(),
  credited_at timestamp with time zone
);

-- Add referral tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN referral_code text UNIQUE,
ADD COLUMN referred_by text,
ADD COLUMN referral_conversions integer NOT NULL DEFAULT 0,
ADD COLUMN free_plans_earned integer NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_links
CREATE POLICY "Users can view own affiliate links"
ON public.affiliate_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate links"
ON public.affiliate_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate links"
ON public.affiliate_links FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate links"
ON public.affiliate_links FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for referral_conversions
CREATE POLICY "Users can view own referral conversions"
ON public.referral_conversions FOR SELECT
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can insert referral conversions"
ON public.referral_conversions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all conversions"
ON public.referral_conversions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger to generate referral code for new users
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_profile_insert_set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();