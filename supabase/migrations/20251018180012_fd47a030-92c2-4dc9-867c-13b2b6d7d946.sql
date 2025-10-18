-- Create custom dashboards table
CREATE TABLE public.custom_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dashboard_name TEXT NOT NULL,
  dashboard_description TEXT,
  widget_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sentiment analysis results table
CREATE TABLE public.sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  form_id UUID NOT NULL,
  sentiment_score NUMERIC NOT NULL,
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('positive', 'negative', 'neutral', 'mixed')),
  confidence NUMERIC NOT NULL,
  key_phrases JSONB DEFAULT '[]'::jsonb,
  emotions JSONB DEFAULT '{}'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(submission_id)
);

-- Create predictive analytics table
CREATE TABLE public.predictive_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  user_id UUID NOT NULL,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('submission_trend', 'completion_rate', 'peak_times', 'user_behavior')),
  prediction_data JSONB NOT NULL,
  confidence_score NUMERIC,
  time_period TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create real-time metrics table
CREATE TABLE public.realtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_dashboards
CREATE POLICY "Users can manage own dashboards"
  ON public.custom_dashboards FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for sentiment_analysis
CREATE POLICY "Users can view sentiment for their forms"
  ON public.sentiment_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = sentiment_analysis.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "System can create sentiment analysis"
  ON public.sentiment_analysis FOR INSERT
  WITH CHECK (true);

-- RLS Policies for predictive_analytics
CREATE POLICY "Users can view predictions for their forms"
  ON public.predictive_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create predictions"
  ON public.predictive_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for realtime_metrics
CREATE POLICY "Users can view metrics for their forms"
  ON public.realtime_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = realtime_metrics.form_id
    AND forms.user_id = auth.uid()
  ));

CREATE POLICY "System can insert metrics"
  ON public.realtime_metrics FOR INSERT
  WITH CHECK (true);

-- Enable realtime for metrics
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_metrics;

-- Create indexes
CREATE INDEX idx_custom_dashboards_user ON public.custom_dashboards(user_id);
CREATE INDEX idx_sentiment_analysis_form ON public.sentiment_analysis(form_id);
CREATE INDEX idx_sentiment_analysis_submission ON public.sentiment_analysis(submission_id);
CREATE INDEX idx_predictive_analytics_form ON public.predictive_analytics(form_id);
CREATE INDEX idx_predictive_analytics_user ON public.predictive_analytics(user_id);
CREATE INDEX idx_realtime_metrics_form ON public.realtime_metrics(form_id);
CREATE INDEX idx_realtime_metrics_time ON public.realtime_metrics(recorded_at);