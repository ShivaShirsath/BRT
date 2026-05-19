create table if not exists core.firm (
  id bigserial primary key,
  code varchar(32) unique not null,
  name varchar(128) not null,
  is_active boolean not null default true
);

alter table core.app_user add column if not exists full_name varchar(128);
alter table core.app_user add column if not exists role_code varchar(32) not null default 'OPERATOR';

create table if not exists txn.purchase (
  id bigserial primary key,
  firm_id varchar(32) not null,
  voucher_no varchar(64) not null,
  business_date date not null,
  supplier_acno varchar(32) not null,
  item_code varchar(64) not null,
  qty numeric(18,3) not null,
  rate numeric(18,2) not null,
  amount numeric(18,2) not null,
  created_by varchar(64) not null,
  created_at timestamptz not null default now()
);

create table if not exists txn.sale (
  id bigserial primary key,
  firm_id varchar(32) not null,
  voucher_no varchar(64) not null,
  business_date date not null,
  customer_acno varchar(32) not null,
  item_code varchar(64) not null,
  qty numeric(18,3) not null,
  rate numeric(18,2) not null,
  amount numeric(18,2) not null,
  created_by varchar(64) not null,
  created_at timestamptz not null default now()
);

insert into core.firm(code,name,is_active) values
('BRT01','BRT TRADING CO.',true),
('BRT02','BRT INDUSTRIES',true)
on conflict (code) do nothing;

insert into core.app_user(firm_id,user_code,password_hash,full_name,role_code,is_active)
values (
  'BRT01',
  'ADMIN',
  '$2a$10$j0M6dyNVV2Q5aFl7sD9sN.3N6Y0x6w.W6mLkRbxMPrz6mP6gU2QIe',
  'System Admin',
  'ADMIN',
  true
)
on conflict (firm_id,user_code) do nothing;

insert into core.menu_item(code,label,route,parent_code,sort_order,is_active) values
('MENU_DASH','Menu','/menu',null,1,true),
('PURCHASE_FORM','Purchase Form','/purchase',null,2,true),
('SALES_FORM','Sales Form','/sales',null,3,true)
on conflict (code) do nothing;
