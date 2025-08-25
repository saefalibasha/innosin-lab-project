
-- Drop the conflicting admin-only policy that blocks all non-admin users
DROP POLICY IF EXISTS "Documents bucket simple admin access" ON storage.objects;

-- Ensure our authenticated user policies exist (create if not exists)
DO $$
BEGIN
    -- Policy for authenticated uploads
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated uploads'
    ) THEN
        CREATE POLICY "Allow authenticated uploads" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
        );
    END IF;

    -- Policy for authenticated reads
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated reads'
    ) THEN
        CREATE POLICY "Allow authenticated reads" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
        );
    END IF;

    -- Policy for authenticated updates
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated updates'
    ) THEN
        CREATE POLICY "Allow authenticated updates" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
        );
    END IF;

    -- Policy for authenticated deletes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated deletes'
    ) THEN
        CREATE POLICY "Allow authenticated deletes" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'documents' 
            AND auth.role() = 'authenticated'
        );
    END IF;
END
$$;

-- Add a separate admin-only policy for enhanced admin access (optional)
CREATE POLICY "Admin full access to documents" ON storage.objects
FOR ALL USING (
    bucket_id = 'documents' 
    AND EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_email = auth.jwt() ->> 'email' 
        AND is_active = true
    )
);
