-- Create storage buckets for form uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('uploaded-forms', 'uploaded-forms', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('processed-forms', 'processed-forms', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- RLS policies for uploaded-forms bucket
CREATE POLICY "Users can upload their own forms"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own uploaded forms"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploaded forms"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploaded-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for processed-forms bucket
CREATE POLICY "Users can upload processed forms"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'processed-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own processed forms"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'processed-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own processed forms"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'processed-forms' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);