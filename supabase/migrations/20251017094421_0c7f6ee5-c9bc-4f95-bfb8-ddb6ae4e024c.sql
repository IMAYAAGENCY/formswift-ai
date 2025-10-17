-- Create storage policies for uploaded-forms bucket
-- Users can upload their own forms
CREATE POLICY "Users can upload own forms"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own uploaded forms
CREATE POLICY "Users can view own uploaded forms"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploaded forms
CREATE POLICY "Users can delete own uploaded forms"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policies for processed-forms bucket
-- Users can view their own processed forms
CREATE POLICY "Users can view own processed forms"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'processed-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- System can insert processed forms (for edge functions)
CREATE POLICY "System can insert processed forms"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'processed-forms'
);

-- Admins can view all forms
CREATE POLICY "Admins can view all forms in uploaded-forms"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'uploaded-forms' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view all forms in processed-forms"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'processed-forms' 
  AND has_role(auth.uid(), 'admin'::app_role)
);