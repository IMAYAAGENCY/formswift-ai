-- Form versions for version control
CREATE TABLE public.form_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form fields with conditional logic
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_label TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  conditional_logic JSONB,
  field_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Digital signatures
CREATE TABLE public.form_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Form scheduling
CREATE TABLE public.form_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Form translations for multi-language support
CREATE TABLE public.form_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translated_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, language_code)
);

-- Enable RLS
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_versions
CREATE POLICY "Users can view versions of their forms"
  ON public.form_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_versions.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create versions for their forms"
  ON public.form_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_versions.form_id
    AND forms.user_id = auth.uid()
  ));

-- RLS Policies for form_fields
CREATE POLICY "Users can view fields of their forms"
  ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage fields of their forms"
  ON public.form_fields FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_fields.form_id
    AND forms.user_id = auth.uid()
  ));

-- RLS Policies for form_signatures
CREATE POLICY "Users can view signatures of their forms"
  ON public.form_signatures FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_signatures.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create signatures"
  ON public.form_signatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for form_schedules
CREATE POLICY "Users can view their own schedules"
  ON public.form_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
  ON public.form_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
  ON public.form_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
  ON public.form_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for form_translations
CREATE POLICY "Users can view translations of their forms"
  ON public.form_translations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_translations.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage translations of their forms"
  ON public.form_translations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_translations.form_id
    AND forms.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_form_versions_form_id ON public.form_versions(form_id);
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_signatures_form_id ON public.form_signatures(form_id);
CREATE INDEX idx_form_schedules_user_id ON public.form_schedules(user_id);
CREATE INDEX idx_form_schedules_scheduled_at ON public.form_schedules(scheduled_at);
CREATE INDEX idx_form_translations_form_id ON public.form_translations(form_id);