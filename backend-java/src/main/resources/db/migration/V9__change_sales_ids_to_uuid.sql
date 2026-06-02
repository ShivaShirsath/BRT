-- V9__change_sales_ids_to_uuid.sql

-- 1. Drop foreign key constraints on children of sale_patti
ALTER TABLE txn.sale_patti_details DROP CONSTRAINT IF EXISTS sale_patti_details_sale_patti_id_fkey;
ALTER TABLE txn.sale_patti_items DROP CONSTRAINT IF EXISTS sale_patti_items_sale_patti_id_fkey;
ALTER TABLE txn.sale_patti_adjustments DROP CONSTRAINT IF EXISTS sale_patti_adjustments_sale_patti_id_fkey;
ALTER TABLE txn.sale_patti_totals DROP CONSTRAINT IF EXISTS sale_patti_totals_sale_patti_id_fkey;
ALTER TABLE txn.sale_patti_transporters DROP CONSTRAINT IF EXISTS sale_patti_transporters_sale_patti_id_fkey;

-- 2. Drop primary key constraints and defaults on sale_patti and sale
ALTER TABLE txn.sale_patti ALTER COLUMN id DROP DEFAULT;
ALTER TABLE txn.sale ALTER COLUMN id DROP DEFAULT;

ALTER TABLE txn.sale_patti DROP CONSTRAINT IF EXISTS sale_patti_pkey;
ALTER TABLE txn.sale DROP CONSTRAINT IF EXISTS sale_pkey CASCADE;

-- 3. Alter sale_patti.id and sale.id to uuid
ALTER TABLE txn.sale_patti 
  ALTER COLUMN id TYPE uuid USING (lpad(to_hex(id), 32, '0')::uuid);

ALTER TABLE txn.sale 
  ALTER COLUMN id TYPE uuid USING (lpad(to_hex(id), 32, '0')::uuid);

-- 4. Alter child reference columns of sale_patti to uuid
ALTER TABLE txn.sale_patti_details 
  ALTER COLUMN sale_patti_id TYPE uuid USING (lpad(to_hex(sale_patti_id), 32, '0')::uuid);

ALTER TABLE txn.sale_patti_items 
  ALTER COLUMN sale_patti_id TYPE uuid USING (lpad(to_hex(sale_patti_id), 32, '0')::uuid);

ALTER TABLE txn.sale_patti_adjustments 
  ALTER COLUMN sale_patti_id TYPE uuid USING (lpad(to_hex(sale_patti_id), 32, '0')::uuid);

ALTER TABLE txn.sale_patti_totals 
  ALTER COLUMN sale_patti_id TYPE uuid USING (lpad(to_hex(sale_patti_id), 32, '0')::uuid);

ALTER TABLE txn.sale_patti_transporters 
  ALTER COLUMN sale_patti_id TYPE uuid USING (lpad(to_hex(sale_patti_id), 32, '0')::uuid);

-- 5. Re-add primary key constraints
ALTER TABLE txn.sale_patti ADD CONSTRAINT sale_patti_pkey PRIMARY KEY (id);
ALTER TABLE txn.sale ADD CONSTRAINT sale_pkey PRIMARY KEY (id);

-- 6. Re-add foreign key constraints
ALTER TABLE txn.sale_patti_details 
  ADD CONSTRAINT fk_sale_patti_details_sale_patti 
  FOREIGN KEY (sale_patti_id) REFERENCES txn.sale_patti(id) ON DELETE CASCADE;

ALTER TABLE txn.sale_patti_items 
  ADD CONSTRAINT fk_sale_patti_items_sale_patti 
  FOREIGN KEY (sale_patti_id) REFERENCES txn.sale_patti(id) ON DELETE CASCADE;

ALTER TABLE txn.sale_patti_adjustments 
  ADD CONSTRAINT fk_sale_patti_adjustments_sale_patti 
  FOREIGN KEY (sale_patti_id) REFERENCES txn.sale_patti(id) ON DELETE CASCADE;

ALTER TABLE txn.sale_patti_totals 
  ADD CONSTRAINT fk_sale_patti_totals_sale_patti 
  FOREIGN KEY (sale_patti_id) REFERENCES txn.sale_patti(id) ON DELETE CASCADE;

ALTER TABLE txn.sale_patti_transporters 
  ADD CONSTRAINT fk_sale_patti_transporters_sale_patti 
  FOREIGN KEY (sale_patti_id) REFERENCES txn.sale_patti(id) ON DELETE CASCADE;
