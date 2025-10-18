-- Audit logs for tracking all activities
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Two-factor authentication settings
CREATE TABLE public.two_factor_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  secret TEXT,
  backup_codes TEXT[],
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Data encryption keys (encrypted at application level)
CREATE TABLE public.encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- GDPR data requests
CREATE TABLE public.gdpr_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  data_url TEXT
);

-- Role permissions (extending existing user_roles)
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  resource TEXT NOT NULL,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_update BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, resource)
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for two_factor_auth
CREATE POLICY "Users can view own 2FA settings"
  ON public.two_factor_auth FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2FA settings"
  ON public.two_factor_auth FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for encryption_keys
CREATE POLICY "Users can view own encryption keys"
  ON public.encryption_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own encryption keys"
  ON public.encryption_keys FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for gdpr_requests
CREATE POLICY "Users can view own GDPR requests"
  ON public.gdpr_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own GDPR requests"
  ON public.gdpr_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all GDPR requests"
  ON public.gdpr_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for role_permissions
CREATE POLICY "Authenticated users can view permissions"
  ON public.role_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage permissions"
  ON public.role_permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
  ('admin', 'forms', true, true, true, true),
  ('admin', 'users', true, true, true, true),
  ('admin', 'teams', true, true, true, true),
  ('user', 'forms', true, true, true, true),
  ('user', 'users', false, true, false, false),
  ('user', 'teams', false, true, false, false)
ON CONFLICT (role, resource) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_two_factor_auth_user_id ON public.two_factor_auth(user_id);
CREATE INDEX idx_gdpr_requests_user_id ON public.gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON public.gdpr_requests(status);