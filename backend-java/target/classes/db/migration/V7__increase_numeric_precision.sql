-- Alter txn.purchase_bill_items columns
ALTER TABLE txn.purchase_bill_items 
  ALTER COLUMN avg_weight TYPE numeric(20,2),
  ALTER COLUMN purchase_weight TYPE numeric(20,2),
  ALTER COLUMN packing_weight TYPE numeric(20,2),
  ALTER COLUMN net_weight TYPE numeric(20,2),
  ALTER COLUMN rate TYPE numeric(20,2),
  ALTER COLUMN amount TYPE numeric(20,2);

-- Alter txn.purchase_bill_charges_taxes columns
ALTER TABLE txn.purchase_bill_charges_taxes
  ALTER COLUMN purchase_amount TYPE numeric(20,2),
  ALTER COLUMN m_tax TYPE numeric(20,2),
  ALTER COLUMN commission TYPE numeric(20,2),
  ALTER COLUMN purchase_commission TYPE numeric(20,2),
  ALTER COLUMN freight TYPE numeric(20,2),
  ALTER COLUMN packing TYPE numeric(20,2),
  ALTER COLUMN loading TYPE numeric(20,2),
  ALTER COLUMN levy TYPE numeric(20,2),
  ALTER COLUMN tolai TYPE numeric(20,2),
  ALTER COLUMN hamali TYPE numeric(20,2),
  ALTER COLUMN discount TYPE numeric(20,2),
  ALTER COLUMN igst TYPE numeric(20,2),
  ALTER COLUMN sgst TYPE numeric(20,2),
  ALTER COLUMN cgst TYPE numeric(20,2),
  ALTER COLUMN tds TYPE numeric(20,2),
  ALTER COLUMN khandani TYPE numeric(20,2),
  ALTER COLUMN our_expenses TYPE numeric(20,2),
  ALTER COLUMN exp_2 TYPE numeric(20,2),
  ALTER COLUMN exp_3 TYPE numeric(20,2),
  ALTER COLUMN exp_4 TYPE numeric(20,2),
  ALTER COLUMN total TYPE numeric(20,2),
  ALTER COLUMN net_total TYPE numeric(20,2);

-- Alter mst.products columns
ALTER TABLE mst.products
  ALTER COLUMN bharti_weight TYPE numeric(20,2);
