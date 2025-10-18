-- User preferences for AI predictions
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_data JSONB NOT NULL DEFAULT '{}',
  learning_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Form recommendations
CREATE TABLE public.form_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  recommended_forms JSONB NOT NULL,
  similarity_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Batch processing jobs
CREATE TABLE public.batch_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  total_forms INTEGER NOT NULL,
  processed_forms INTEGER NOT NULL DEFAULT 0,
  failed_forms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Voice recordings for voice-to-form
CREATE TABLE public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  transcription TEXT,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extracted data from emails/PDFs
CREATE TABLE public.extracted_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_path TEXT,
  extracted_fields JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for form_recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.form_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
  ON public.form_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for batch_jobs
CREATE POLICY "Users can view own batch jobs"
  ON public.batch_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own batch jobs"
  ON public.batch_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batch jobs"
  ON public.batch_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_recordings
CREATE POLICY "Users can view own recordings"
  ON public.voice_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recordings"
  ON public.voice_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON public.voice_recordings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for extracted_data
CREATE POLICY "Users can view own extracted data"
  ON public.extracted_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own extracted data"
  ON public.extracted_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own extracted data"
  ON public.extracted_data FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_form_recommendations_user_id ON public.form_recommendations(user_id);
CREATE INDEX idx_batch_jobs_user_id ON public.batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON public.batch_jobs(status);
CREATE INDEX idx_voice_recordings_user_id ON public.voice_recordings(user_id);
CREATE INDEX idx_extracted_data_user_id ON public.extracted_data(user_id);