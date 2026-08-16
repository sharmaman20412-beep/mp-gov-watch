
CREATE POLICY "evidence_upload_any" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'complaint-evidence');
CREATE POLICY "evidence_read_officials" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'complaint-evidence' AND public.is_official(auth.uid()));
