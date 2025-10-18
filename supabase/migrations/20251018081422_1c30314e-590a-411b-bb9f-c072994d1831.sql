-- Add n8n webhook URL to profiles table
ALTER TABLE public.profiles 
ADD COLUMN n8n_webhook_url text;