
-- Delete all PDF content entries (this will cascade and clean up related data)
DELETE FROM pdf_content;

-- Delete all knowledge base entries that were auto-generated from PDFs
DELETE FROM knowledge_base_entries WHERE auto_generated = true;

-- Delete all PDF documents (this will remove all uploaded PDFs)
DELETE FROM pdf_documents;

-- Reset any sequences if needed (optional, but helps keep IDs clean)
-- This ensures the next uploads start with clean IDs
