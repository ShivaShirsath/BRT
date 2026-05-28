create table if not exists txn.purchase_bills (
  id bigserial primary key,
  bill_no varchar(50) not null unique,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists txn.purchase_bill_details (
  id bigserial primary key,
  purchase_bill_id bigint not null unique references txn.purchase_bills(id),
  bill_date date not null,
  entry_type varchar(100),
  cess_condition varchar(100),
  seller_id bigint,
  vehicle_no varchar(50),
  party_bill_no varchar(100),
  created_at timestamptz not null default now()
);

create table if not exists txn.purchase_bill_items (
  id bigserial primary key,
  purchase_bill_id bigint not null references txn.purchase_bills(id),
  item_no int,
  commodity_id bigint,
  mark_id bigint,
  brand_id bigint,
  bags int not null default 0,
  avg_weight numeric(12,2) not null default 0,
  purchase_weight numeric(12,2) not null default 0,
  packing_weight numeric(12,2) not null default 0,
  net_weight numeric(12,2) not null default 0,
  rate numeric(12,2) not null default 0,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists txn.purchase_bill_charges_taxes (
  id bigserial primary key,
  purchase_bill_id bigint not null unique references txn.purchase_bills(id),

  purchase_amount numeric(12,2) not null default 0,
  m_tax numeric(12,2) not null default 0,
  commission numeric(12,2) not null default 0,
  purchase_commission numeric(12,2) not null default 0,
  freight numeric(12,2) not null default 0,
  packing numeric(12,2) not null default 0,
  loading numeric(12,2) not null default 0,
  levy numeric(12,2) not null default 0,
  tolai numeric(12,2) not null default 0,
  hamali numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  igst numeric(12,2) not null default 0,
  sgst numeric(12,2) not null default 0,
  cgst numeric(12,2) not null default 0,
  tds numeric(12,2) not null default 0,
  khandani numeric(12,2) not null default 0,
  our_expenses numeric(12,2) not null default 0,
  exp_2 numeric(12,2) not null default 0,
  exp_3 numeric(12,2) not null default 0,
  exp_4 numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  net_total numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);
