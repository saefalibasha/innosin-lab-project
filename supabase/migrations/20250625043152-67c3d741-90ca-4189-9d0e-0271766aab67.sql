
-- Check what constraint violations are happening with correct column names
SELECT conname as constraint_name, conrelid::regclass as table_name 
FROM pg_constraint 
WHERE conname LIKE '%content_type%' OR conname LIKE '%processing_status%';

-- Check what values are actually allowed for content_type in pdf_content table
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pdf_content'::regclass AND conname LIKE '%content_type%';

-- Check what values are actually allowed for processing_status in pdf_documents table
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pdf_documents'::regclass AND conname LIKE '%processing_status%';

-- Clean up all failed processing attempts - delete all pdf_content entries for failed documents
DELETE FROM pdf_content 
WHERE document_id IN (
    SELECT id FROM pdf_documents 
    WHERE processing_status IN ('error', 'processing')
);

-- Delete all knowledge base entries that were auto-generated from failed documents
DELETE FROM knowledge_base_entries 
WHERE auto_generated = true 
AND source_document_id IN (
    SELECT id FROM pdf_documents 
    WHERE processing_status IN ('error', 'processing')
);

-- Reset all documents back to pending status so we can reprocess them
UPDATE pdf_documents 
SET processing_status = 'pending', 
    processing_error = NULL, 
    last_processed = NULL 
WHERE processing_status IN ('error', 'processing');
