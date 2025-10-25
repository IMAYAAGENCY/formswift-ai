-- Update default form limit for free plan to 10
UPDATE public.profiles
SET form_limit = 10
WHERE plan_type = 'Free' OR plan_type IS NULL;

-- Update the default for new users
ALTER TABLE public.profiles 
ALTER COLUMN form_limit SET DEFAULT 10;