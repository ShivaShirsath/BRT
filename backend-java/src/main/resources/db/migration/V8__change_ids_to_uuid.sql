-- V8__change_ids_to_uuid.sql

-- 1. Drop foreign key constraints on children of purchase_bills
ALTER TABLE txn.purchase_bill_details DROP CONSTRAINT IF EXISTS purchase_bill_details_purchase_bill_id_fkey;
ALTER TABLE txn.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_purchase_bill_id_fkey;
ALTER TABLE txn.purchase_bill_charges_taxes DROP CONSTRAINT IF EXISTS purchase_bill_charges_taxes_purchase_bill_id_fkey;

-- 2. Drop primary key constraints and defaults on purchase_bills and purchase
-- Use CASCADE on purchase_pkey to drop dependent constraint purchase_item_purchase_id_fkey on txn.purchase_item
ALTER TABLE txn.purchase_bills ALTER COLUMN id DROP DEFAULT;
ALTER TABLE txn.purchase ALTER COLUMN id DROP DEFAULT;

ALTER TABLE txn.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_pkey;
ALTER TABLE txn.purchase DROP CONSTRAINT IF EXISTS purchase_pkey CASCADE;

-- 3. Alter purchase_bills.id and purchase.id to uuid
ALTER TABLE txn.purchase_bills 
  ALTER COLUMN id TYPE uuid USING (lpad(to_hex(id), 32, '0')::uuid);

ALTER TABLE txn.purchase 
  ALTER COLUMN id TYPE uuid USING (lpad(to_hex(id), 32, '0')::uuid);

-- 4. Alter child reference columns of purchase_bills to uuid
ALTER TABLE txn.purchase_bill_details 
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

ALTER TABLE txn.purchase_bill_items 
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

ALTER TABLE txn.purchase_bill_charges_taxes 
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

-- 5. Alter child reference column of purchase (purchase_item.purchase_id) to uuid
ALTER TABLE txn.purchase_item 
  ALTER COLUMN purchase_id TYPE uuid USING (lpad(to_hex(purchase_id), 32, '0')::uuid);

-- 6. Re-add primary key constraints
ALTER TABLE txn.purchase_bills ADD CONSTRAINT purchase_bills_pkey PRIMARY KEY (id);
ALTER TABLE txn.purchase ADD CONSTRAINT purchase_pkey PRIMARY KEY (id);

-- 7. Re-add foreign key constraints
ALTER TABLE txn.purchase_bill_details 
  ADD CONSTRAINT fk_purchase_bill_details_purchase_bill 
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

ALTER TABLE txn.purchase_bill_items 
  ADD CONSTRAINT fk_purchase_bill_items_purchase_bill 
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

ALTER TABLE txn.purchase_bill_charges_taxes 
  ADD CONSTRAINT fk_purchase_bill_charges_taxes_purchase_bill 
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

ALTER TABLE txn.purchase_item 
  ADD CONSTRAINT fk_purchase_item_purchase 
  FOREIGN KEY (purchase_id) REFERENCES txn.purchase(id) ON DELETE CASCADE;
