-- V15__create_purchase_and_sale_tables.sql
-- Handles the product_id column mapping and foreign key constraint for txn.purchase_bill_items

-- 1. Add product_id column to txn.purchase_bill_items
ALTER TABLE txn.purchase_bill_items ADD COLUMN IF NOT EXISTS product_id bigint;

-- 2. Insert a default product if none exists
INSERT INTO mst.products (code, marathi_name, english_name, bharti_weight, description)
VALUES ('DEFAULT', 'Default Product', 'Default Product', 0.00, 'Default Product')
ON CONFLICT (code) DO NOTHING;

-- 3. Set default product_id for existing null rows
UPDATE txn.purchase_bill_items
SET product_id = (SELECT id FROM mst.products WHERE code = 'DEFAULT')
WHERE product_id IS NULL;

-- 4. Alter column to NOT NULL
ALTER TABLE txn.purchase_bill_items ALTER COLUMN product_id SET NOT NULL;

-- 5. Add foreign key constraint
ALTER TABLE txn.purchase_bill_items DROP CONSTRAINT IF EXISTS fk_purchase_bill_items_product;
ALTER TABLE txn.purchase_bill_items
  ADD CONSTRAINT fk_purchase_bill_items_product
  FOREIGN KEY (product_id) REFERENCES mst.products(id);

-- 6. Drop the old commodity_id column if it exists
ALTER TABLE txn.purchase_bill_items DROP COLUMN IF EXISTS commodity_id;
