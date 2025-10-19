-- Create table for third-party affiliate banners
CREATE TABLE public.affiliate_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- e.g., 'AppSumo', 'vCommission', 'ClickBank'
  banner_url TEXT NOT NULL,
  affiliate_link TEXT NOT NULL,
  display_location TEXT NOT NULL DEFAULT 'footer', -- 'footer', 'sidebar', 'page-specific'
  page_category TEXT, -- null for global, or specific page like 'dashboard', 'forms', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking affiliate banner clicks
CREATE TABLE public.affiliate_banner_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.affiliate_banners(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  page_url TEXT
);

-- Enable RLS
ALTER TABLE public.affiliate_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_banner_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_banners
CREATE POLICY "Anyone can view active affiliate banners"
  ON public.affiliate_banners
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage affiliate banners"
  ON public.affiliate_banners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for affiliate_banner_clicks
CREATE POLICY "Anyone can insert clicks"
  ON public.affiliate_banner_clicks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all clicks"
  ON public.affiliate_banner_clicks
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_affiliate_banners_active ON public.affiliate_banners(is_active, display_location);
CREATE INDEX idx_affiliate_banner_clicks_banner ON public.affiliate_banner_clicks(banner_id, clicked_at DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_banner_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_affiliate_banners_timestamp
  BEFORE UPDATE ON public.affiliate_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_banner_timestamp();