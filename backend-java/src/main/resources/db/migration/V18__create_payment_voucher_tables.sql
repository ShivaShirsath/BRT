-- V18__create_payment_voucher_tables.sql

CREATE TABLE IF NOT EXISTS txn.payment_vouchers (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  voucher_suffix varchar(50),
  business_date date NOT NULL,
  cost_center varchar(100),
  account_type varchar(100),
  ledger_account varchar(255),
  customer_id bigint REFERENCES mst.customer(id),
  balance_amount numeric(12,2) DEFAULT 0.00,
  amount numeric(12,2) DEFAULT 0.00,
  interest_percent numeric(12,2) DEFAULT 0.00,
  bank_charges numeric(12,2) DEFAULT 0.00,
  discount numeric(12,2) DEFAULT 0.00,
  tds_amount numeric(12,2) DEFAULT 0.00,
  paid_from varchar(255),
  payment_mode varchar(100),
  payment_mode_details varchar(255),
  chq_of_bank varchar(255),
  narration text,
  image_data text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS txn.payment_voucher_allocations (
  id bigserial PRIMARY KEY,
  voucher_id uuid NOT NULL REFERENCES txn.payment_vouchers(id) ON DELETE CASCADE,
  allocation_date varchar(100),
  amount numeric(12,2) DEFAULT 0.00
);
