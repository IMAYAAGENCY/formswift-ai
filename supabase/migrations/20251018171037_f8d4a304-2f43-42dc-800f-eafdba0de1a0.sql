-- Create table for tracking user interactions (clicks, field focus, etc.)
CREATE TABLE IF NOT EXISTS public.form_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'click', 'focus', 'blur', 'scroll', 'submit'
  element_id TEXT,
  element_type TEXT,
  position_x INTEGER,
  position_y INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for conversion funnel tracking
CREATE TABLE IF NOT EXISTS public.form_funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER, -- seconds
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_interactions_form_id ON public.form_interactions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_interactions_timestamp ON public.form_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_form_interactions_type ON public.form_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_form_funnel_form_id ON public.form_funnel_steps(form_id);
CREATE INDEX IF NOT EXISTS idx_form_funnel_session ON public.form_funnel_steps(session_id);

-- Enable RLS
ALTER TABLE public.form_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_funnel_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_interactions
CREATE POLICY "Users can view interactions for their forms"
ON public.form_interactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_interactions.form_id
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert interactions"
ON public.form_interactions
FOR INSERT
WITH CHECK (true);

-- RLS Policies for form_funnel_steps
CREATE POLICY "Users can view funnel data for their forms"
ON public.form_funnel_steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = form_funnel_steps.form_id
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert funnel steps"
ON public.form_funnel_steps
FOR INSERT
WITH CHECK (true);