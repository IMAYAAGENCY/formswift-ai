-- Create rate_limits table for API rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint_created 
ON public.rate_limits(user_id, endpoint, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rate limit records
CREATE POLICY "Users can view own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can insert rate limit records
CREATE POLICY "Service role can insert rate limits" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (true);

-- Cleanup old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a scheduled job to cleanup old records (if pg_cron is available)
-- Note: This will silently fail if pg_cron is not enabled, which is fine
DO $$
BEGIN
  PERFORM cron.schedule(
    'cleanup-rate-limits',
    '0 * * * *', -- Every hour
    'SELECT public.cleanup_old_rate_limits()'
  );
EXCEPTION WHEN OTHERS THEN
  -- Ignore if pg_cron is not available
  NULL;
END $$;