-- Create form pages table for multi-page forms
CREATE TABLE public.form_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  user_id UUID NOT NULL,
  page_number INTEGER NOT NULL,
  page_title TEXT NOT NULL,
  page_description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, page_number)
);

-- Create form progress table for save & resume
CREATE TABLE public.form_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  user_identifier TEXT NOT NULL,
  current_page INTEGER NOT NULL DEFAULT 1,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, user_identifier)
);

-- Create embedded forms table
CREATE TABLE public.embedded_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  user_id UUID NOT NULL,
  embed_code TEXT NOT NULL,
  allowed_domains JSONB DEFAULT '[]'::jsonb,
  custom_css TEXT,
  custom_js TEXT,
  show_branding BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views_count INTEGER NOT NULL DEFAULT 0,
  submissions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id)
);

-- Create offline submissions queue table
CREATE TABLE public.offline_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  submission_data JSONB NOT NULL,
  device_info JSONB,
  client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedded_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_pages
CREATE POLICY "Users can manage pages for their forms"
  ON public.form_pages FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for form_progress
CREATE POLICY "Users can view own progress"
  ON public.form_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can save own progress"
  ON public.form_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own progress"
  ON public.form_progress FOR UPDATE
  USING (true);

-- RLS Policies for embedded_forms
CREATE POLICY "Users can manage own embedded forms"
  ON public.embedded_forms FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active embedded forms"
  ON public.embedded_forms FOR SELECT
  USING (is_active = true);

-- RLS Policies for offline_submissions
CREATE POLICY "Users can view submissions for their forms"
  ON public.offline_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = offline_submissions.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create offline submissions"
  ON public.offline_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update offline submissions"
  ON public.offline_submissions FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX idx_form_pages_form ON public.form_pages(form_id);
CREATE INDEX idx_form_pages_user ON public.form_pages(user_id);
CREATE INDEX idx_form_progress_form ON public.form_progress(form_id);
CREATE INDEX idx_form_progress_identifier ON public.form_progress(user_identifier);
CREATE INDEX idx_embedded_forms_form ON public.embedded_forms(form_id);
CREATE INDEX idx_embedded_forms_user ON public.embedded_forms(user_id);
CREATE INDEX idx_offline_submissions_form ON public.offline_submissions(form_id);
CREATE INDEX idx_offline_submissions_status ON public.offline_submissions(sync_status);