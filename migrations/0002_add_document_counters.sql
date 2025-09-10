-- Document number counters table
CREATE TABLE IF NOT EXISTS document_counters (
  document_type TEXT PRIMARY KEY,
  current_number INTEGER NOT NULL DEFAULT 0
);

-- Initialize counters for each document type
INSERT OR IGNORE INTO document_counters (document_type, current_number) VALUES 
  ('invoice', 0),
  ('receipt', 0),
  ('quote', 0);

-- Update existing documents to have proper auto-generated numbers
-- Count existing documents and update counters accordingly
UPDATE document_counters SET current_number = (
  SELECT COUNT(*) FROM documents WHERE document_type = document_counters.document_type
);

-- Add unique constraint to document_number per document_type if not exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_type_number 
ON documents(document_type, document_number);