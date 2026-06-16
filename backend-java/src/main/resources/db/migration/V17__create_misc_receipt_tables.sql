-- V17__create_misc_receipt_tables.sql

CREATE TABLE IF NOT EXISTS txn.misc_receipts (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  voucher_suffix varchar(50),
  business_date date NOT NULL,
  account_type varchar(100),
  ledger_account varchar(255),
  customer_id bigint REFERENCES mst.customer(id),
  balance numeric(12,2) DEFAULT 0.00,
  amount numeric(12,2) DEFAULT 0.00,
  interest_percent numeric(12,2) DEFAULT 0.00,
  discount numeric(12,2) DEFAULT 0.00,
  tds_amount numeric(12,2) DEFAULT 0.00,
  deposited_in varchar(255),
  payment_mode varchar(100),
  payment_mode_details varchar(255),
  chq_of_bank varchar(255),
  narration text,
  created_at timestamptz NOT NULL DEFAULT now()
);
