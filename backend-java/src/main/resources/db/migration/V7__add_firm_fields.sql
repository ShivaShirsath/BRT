-- Migration to add extra fields to the firm table
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS book_start_date date;
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS business_type varchar(64);
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS financial_year varchar(32);
