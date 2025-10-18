-- Create form security settings table
CREATE TABLE public.form_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  user_id UUID NOT NULL,
  captcha_enabled BOOLEAN NOT NULL DEFAULT false,
  captcha_provider TEXT CHECK (captcha_provider IN ('recaptcha', 'hcaptcha', 'turnstile')),
  password_hash TEXT,
  rate_limit_enabled BOOLEAN NOT NULL DEFAULT false,
  rate_limit_max_attempts INTEGER DEFAULT 10,
  rate_limit_window_minutes INTEGER DEFAULT 60,
  ip_blocking_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id)
);

-- Create blocked IPs table
CREATE TABLE public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ip_address INET NOT NULL,
  reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ip_address)
);

-- Create submission rate limits tracking table
CREATE TABLE public.submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  identifier TEXT NOT NULL, -- IP address or user_id
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(form_id, identifier)
);

-- Enable RLS
ALTER TABLE public.form_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_security_settings
CREATE POLICY "Users can manage security settings for their forms"
  ON public.form_security_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for blocked_ips
CREATE POLICY "Users can manage own blocked IPs"
  ON public.blocked_ips FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for submission_rate_limits
CREATE POLICY "Users can view rate limits for their forms"
  ON public.submission_rate_limits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = submission_rate_limits.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "System can manage rate limits"
  ON public.submission_rate_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rate limits"
  ON public.submission_rate_limits FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_form_security_settings_form ON public.form_security_settings(form_id);
CREATE INDEX idx_form_security_settings_user ON public.form_security_settings(user_id);
CREATE INDEX idx_blocked_ips_user ON public.blocked_ips(user_id);
CREATE INDEX idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX idx_submission_rate_limits_form ON public.submission_rate_limits(form_id);
CREATE INDEX idx_submission_rate_limits_identifier ON public.submission_rate_limits(identifier);