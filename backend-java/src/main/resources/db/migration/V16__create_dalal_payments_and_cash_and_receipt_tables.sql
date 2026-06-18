-- V16__create_dalal_payments_and_cash_and_receipt_tables.sql

-- 1. Dalal Payments
CREATE TABLE IF NOT EXISTS txn.dalal_payment_vouchers (
  id uuid PRIMARY KEY,
  bill_no varchar(50) NOT NULL UNIQUE,
  business_date date NOT NULL,
  ledger_account varchar(255),
  customer_id bigint REFERENCES mst.customer(id),
  balance_amount numeric(12,2) DEFAULT 0.00,
  amount numeric(12,2) DEFAULT 0.00,
  paid_from varchar(255),
  mode varchar(100),
  ref_no varchar(100),
  discount numeric(12,2) DEFAULT 0.00,
  bank_charges numeric(12,2) DEFAULT 0.00,
  tds_amount numeric(12,2) DEFAULT 0.00,
  comm numeric(12,2) DEFAULT 0.00,
  narration text,
  selected_bank varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS txn.dalal_payment_allocations (
  id bigserial PRIMARY KEY,
  voucher_id uuid NOT NULL REFERENCES txn.dalal_payment_vouchers(id) ON DELETE CASCADE,
  allocation_date varchar(100),
  act_amount numeric(12,2) DEFAULT 0.00,
  bal_amount numeric(12,2) DEFAULT 0.00,
  no varchar(100)
);

-- 2. Dalal Payment 1 / 2
CREATE TABLE IF NOT EXISTS txn.dalal_payment_1_vouchers (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  business_date date NOT NULL,
  token_no varchar(50),
  rtgs_after_1pm boolean DEFAULT false,
  created_by varchar(100),
  by_hand varchar(255),
  party_address text,
  balance numeric(12,2) DEFAULT 0.00,
  crate_amt numeric(12,2) DEFAULT 0.00,
  rtgs_charges numeric(12,2) DEFAULT 0.00,
  party_bank varchar(255),
  mode varchar(100),
  bank_account varchar(255),
  cheque_dd_no varchar(100),
  rtgs_date varchar(100),
  cash_amount numeric(12,2) DEFAULT 0.00,
  dd_commission numeric(12,2) DEFAULT 0.00,
  selected_quick_bank varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS txn.dalal_payment_1_details (
  id bigserial PRIMARY KEY,
  voucher_id uuid NOT NULL REFERENCES txn.dalal_payment_1_vouchers(id) ON DELETE CASCADE,
  farmer_name varchar(255),
  farmer_id bigint REFERENCES mst.customer(id),
  patti_no varchar(100),
  amount numeric(12,2) DEFAULT 0.00,
  tds_rs numeric(12,2) DEFAULT 0.00,
  cheque_no varchar(100),
  narration varchar(255)
);

-- 3. Cash Deposit
CREATE TABLE IF NOT EXISTS txn.cash_deposits (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  business_date date NOT NULL,
  created_by varchar(100),
  bank_account varchar(255),
  amount numeric(12,2) DEFAULT 0.00,
  narration text,
  denominations_json text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Cash Withdrawal
CREATE TABLE IF NOT EXISTS txn.cash_withdrawals (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  business_date date NOT NULL,
  created_by varchar(100),
  bank_account varchar(255),
  current_balance numeric(12,2) DEFAULT 0.00,
  amount numeric(12,2) DEFAULT 0.00,
  ref_no varchar(100),
  narration text,
  denominations_json text,
  quick_bank varchar(100),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Customer Receipt
CREATE TABLE IF NOT EXISTS txn.customer_receipts (
  id uuid PRIMARY KEY,
  voucher_no varchar(50) NOT NULL UNIQUE,
  business_date date NOT NULL,
  received_as_deposit boolean DEFAULT false,
  customer_name varchar(255),
  customer_id bigint REFERENCES mst.customer(id),
  balance numeric(12,2) DEFAULT 0.00,
  amount numeric(12,2) DEFAULT 0.00,
  discount numeric(12,2) DEFAULT 0.00,
  bill_difference numeric(12,2) DEFAULT 0.00,
  tds_amount numeric(12,2) DEFAULT 0.00,
  tcs_percent numeric(12,3) DEFAULT 0.000,
  tcs_total numeric(12,2) DEFAULT 0.00,
  deposited_in varchar(255),
  bank_chq_details varchar(255),
  bank_charges numeric(12,2) DEFAULT 0.00,
  narration text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS txn.customer_receipt_allocations (
  id bigserial PRIMARY KEY,
  receipt_id uuid NOT NULL REFERENCES txn.customer_receipts(id) ON DELETE CASCADE,
  allocation_date varchar(100),
  bill_no varchar(100),
  amount numeric(12,2) DEFAULT 0.00,
  settled numeric(12,2) DEFAULT 0.00
);
