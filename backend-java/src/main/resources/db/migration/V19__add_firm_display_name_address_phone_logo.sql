-- Migration to add display name, address, phone and logo fields to the firm table
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS display_name varchar(256);
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS phone varchar(32);
ALTER TABLE core.firm ADD COLUMN IF NOT EXISTS logo text;
