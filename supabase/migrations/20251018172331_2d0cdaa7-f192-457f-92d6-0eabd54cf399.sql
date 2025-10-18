-- White-label settings table
CREATE TABLE IF NOT EXISTS public.white_label_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  custom_domain TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for white_label_settings
CREATE POLICY "Users can view own white-label settings"
  ON public.white_label_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own white-label settings"
  ON public.white_label_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own white-label settings"
  ON public.white_label_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own white-label settings"
  ON public.white_label_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Consulting services table
CREATE TABLE IF NOT EXISTS public.consulting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  message TEXT NOT NULL,
  budget_range TEXT,
  preferred_start_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consulting_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consulting_requests
CREATE POLICY "Users can view own consulting requests"
  ON public.consulting_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create consulting requests"
  ON public.consulting_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consulting requests"
  ON public.consulting_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update consulting requests"
  ON public.consulting_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_usage
CREATE POLICY "Users can view own API usage"
  ON public.api_usage
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.api_keys
    WHERE api_keys.id = api_usage.api_key_id
    AND api_keys.user_id = auth.uid()
  ));

CREATE POLICY "System can insert API usage"
  ON public.api_usage
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_white_label_settings_user_id ON public.white_label_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_consulting_requests_user_id ON public.consulting_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_consulting_requests_status ON public.consulting_requests(status);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON public.api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);