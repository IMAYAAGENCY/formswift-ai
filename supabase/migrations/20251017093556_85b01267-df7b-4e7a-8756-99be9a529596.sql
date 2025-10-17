-- Add DELETE policy for profiles table to allow users to delete their own profile
-- This addresses the MISSING_RLS security finding and enables self-service account deletion

CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);