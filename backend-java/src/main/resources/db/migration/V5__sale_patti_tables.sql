create table if not exists txn.sale_patti (
  id bigserial primary key,
  sale_patti_no varchar(50) not null unique,
  remark text,
  sales_completed boolean not null default false,
  transporter_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists txn.sale_patti_details (
  id bigserial primary key,
  sale_patti_id bigint not null unique references txn.sale_patti(id),
  customer_id bigint,
  delivery_address text,
  vehicle_no varchar(50),
  party_bill_no varchar(100),
  patti_date date,
  created_at timestamptz not null default now()
);

create table if not exists txn.sale_patti_items (
  id bigserial primary key,
  sale_patti_id bigint not null references txn.sale_patti(id),
  item_no int,
  book_date date,
  patti_no varchar(100),
  patti_item_date date,
  bags int not null default 0,
  patti_weight numeric(12,2) not null default 0,
  patti_freight numeric(12,2) not null default 0,
  commission numeric(12,2) not null default 0,
  tds_percentage numeric(5,2) not null default 0,
  tds_amount numeric(12,2) not null default 0,
  patti_net numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists txn.sale_patti_adjustments (
  id bigserial primary key,
  sale_patti_id bigint not null references txn.sale_patti(id),
  adjustment_type varchar(20),
  description varchar(255),
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists txn.sale_patti_totals (
  id bigserial primary key,
  sale_patti_id bigint not null unique references txn.sale_patti(id),
  as_per_challan numeric(12,2) not null default 0,
  total_adjustment numeric(12,2) not null default 0,
  patti_net_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists txn.sale_patti_transporters (
  id bigserial primary key,
  sale_patti_id bigint not null unique references txn.sale_patti(id),
  transporter_name varchar(255),
  party_advance numeric(12,2) not null default 0,
  expected_date date,
  incentive_hour int,
  incentive_minute int,
  incentive_period varchar(5),
  lorry_no varchar(50),
  phone varchar(20),
  driver_name varchar(255),
  license_number varchar(100),
  own_outside varchar(20),
  amount numeric(12,2) not null default 0,
  extra_freight_rate numeric(12,2) not null default 0,
  brokerage numeric(12,2) not null default 0,
  lorry_freight numeric(12,2) not null default 0,
  hamul numeric(12,2) not null default 0,
  coolie_advance numeric(12,2) not null default 0,
  freight_advance numeric(12,2) not null default 0,
  balance_freight numeric(12,2) not null default 0,
  secondary_driver_name varchar(255),
  created_at timestamptz not null default now()
);

