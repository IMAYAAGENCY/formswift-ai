-- Create API keys table for REST API access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{"read": true, "write": false}'::jsonb
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.custom_webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view logs for their webhooks"
  ON public.webhook_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.custom_webhooks
    WHERE custom_webhooks.id = webhook_logs.webhook_id
    AND custom_webhooks.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);