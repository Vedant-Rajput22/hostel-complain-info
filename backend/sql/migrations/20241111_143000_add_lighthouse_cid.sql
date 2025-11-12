-- Migration: Add Lighthouse CID support
-- Description: Adds lighthouse_cid column to complaints table for blockchain storage
-- Date: 2024-11-11
-- Version: 20241111_143000

-- Add lighthouse_cid column after image_url
ALTER TABLE complaints
ADD COLUMN lighthouse_cid VARCHAR(100) NULL AFTER image_url;

-- Add comment to document the column
-- This column stores the Content Identifier (CID) from Lighthouse/IPFS
-- for permanent, decentralized storage of complaint data

-- Add index for potential queries (optional, for performance)
CREATE INDEX idx_complaints_lighthouse_cid ON complaints(lighthouse_cid);

-- Verification query (uncomment to check after migration)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'complaints' AND column_name = 'lighthouse_cid';
