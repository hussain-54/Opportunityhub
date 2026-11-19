
CREATE POLICY "Public read of opportunity images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'opportunity-images');

CREATE POLICY "Admin can upload opportunity images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'opportunity-images' AND public.is_admin());

CREATE POLICY "Admin can update opportunity images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'opportunity-images' AND public.is_admin());

CREATE POLICY "Admin can delete opportunity images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'opportunity-images' AND public.is_admin());
