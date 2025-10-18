-- Create payment integrations table
CREATE TABLE public.payment_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'razorpay')),
  api_key_encrypted TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  currency TEXT NOT NULL DEFAULT 'USD',
  test_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email marketing integrations table
CREATE TABLE public.email_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('mailchimp', 'sendgrid', 'hubspot', 'activecampaign')),
  api_key_encrypted TEXT NOT NULL,
  list_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  sync_settings JSONB DEFAULT '{"sync_on_submit": true, "fields_mapping": {}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CRM integrations table
CREATE TABLE public.crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('salesforce', 'hubspot', 'zoho', 'pipedrive')),
  api_key_encrypted TEXT NOT NULL,
  instance_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  sync_settings JSONB DEFAULT '{"sync_on_submit": true, "object_type": "Lead", "fields_mapping": {}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progressive profiling table
CREATE TABLE public.progressive_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_email TEXT NOT NULL,
  collected_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_interaction TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interaction_count INTEGER NOT NULL DEFAULT 1,
  completion_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_email)
);

-- Create form payments table
CREATE TABLE public.form_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  submission_id UUID,
  payment_provider TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  payer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_integrations
CREATE POLICY "Users can manage own payment integrations"
  ON public.payment_integrations FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for email_integrations
CREATE POLICY "Users can manage own email integrations"
  ON public.email_integrations FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for crm_integrations
CREATE POLICY "Users can manage own CRM integrations"
  ON public.crm_integrations FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for progressive_profiles
CREATE POLICY "Users can view own progressive profiles"
  ON public.progressive_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create progressive profiles"
  ON public.progressive_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progressive profiles"
  ON public.progressive_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for form_payments
CREATE POLICY "Users can view payments for their forms"
  ON public.form_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_payments.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create form payments"
  ON public.form_payments FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_payment_integrations_user ON public.payment_integrations(user_id);
CREATE INDEX idx_email_integrations_user ON public.email_integrations(user_id);
CREATE INDEX idx_crm_integrations_user ON public.crm_integrations(user_id);
CREATE INDEX idx_progressive_profiles_email ON public.progressive_profiles(user_id, profile_email);
CREATE INDEX idx_form_payments_form ON public.form_payments(form_id);