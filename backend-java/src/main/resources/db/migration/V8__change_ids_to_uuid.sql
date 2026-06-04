-- V8__change_ids_to_uuid.sql
-- Migrate purchase_bills and its children from bigint ids to uuid

-- 1. Drop foreign key constraints on children of purchase_bills
ALTER TABLE txn.purchase_bill_details DROP CONSTRAINT IF EXISTS purchase_bill_details_purchase_bill_id_fkey;
ALTER TABLE txn.purchase_bill_items DROP CONSTRAINT IF EXISTS purchase_bill_items_purchase_bill_id_fkey;
ALTER TABLE txn.purchase_bill_charges_taxes DROP CONSTRAINT IF EXISTS purchase_bill_charges_taxes_purchase_bill_id_fkey;

-- 2. Drop primary key constraint and default on purchase_bills
ALTER TABLE txn.purchase_bills ALTER COLUMN id DROP DEFAULT;
ALTER TABLE txn.purchase_bills DROP CONSTRAINT IF EXISTS purchase_bills_pkey;

-- 3. Alter purchase_bills.id to uuid
ALTER TABLE txn.purchase_bills
  ALTER COLUMN id TYPE uuid USING (lpad(to_hex(id), 32, '0')::uuid);

-- 4. Alter child reference columns of purchase_bills to uuid
ALTER TABLE txn.purchase_bill_details
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

ALTER TABLE txn.purchase_bill_items
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

ALTER TABLE txn.purchase_bill_charges_taxes
  ALTER COLUMN purchase_bill_id TYPE uuid USING (lpad(to_hex(purchase_bill_id), 32, '0')::uuid);

-- 5. Re-add primary key constraint
ALTER TABLE txn.purchase_bills ADD CONSTRAINT purchase_bills_pkey PRIMARY KEY (id);

-- 6. Re-add foreign key constraints
ALTER TABLE txn.purchase_bill_details
  ADD CONSTRAINT fk_purchase_bill_details_purchase_bill
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

ALTER TABLE txn.purchase_bill_items
  ADD CONSTRAINT fk_purchase_bill_items_purchase_bill
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

ALTER TABLE txn.purchase_bill_charges_taxes
  ADD CONSTRAINT fk_purchase_bill_charges_taxes_purchase_bill
  FOREIGN KEY (purchase_bill_id) REFERENCES txn.purchase_bills(id) ON DELETE CASCADE;

