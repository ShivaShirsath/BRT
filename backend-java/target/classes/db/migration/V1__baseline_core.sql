create schema if not exists core;
create schema if not exists master;
create schema if not exists txn;
create schema if not exists ledger;
create schema if not exists mig;

create table if not exists core.app_user (
  id bigserial primary key,
  firm_id varchar(32) not null,
  user_code varchar(64) not null,
  password_hash varchar(255) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (firm_id, user_code)
);

create table if not exists core.role (
  id bigserial primary key,
  code varchar(64) unique not null,
  name varchar(128) not null
);

create table if not exists core.permission (
  id bigserial primary key,
  code varchar(128) unique not null,
  description varchar(255)
);

create table if not exists core.user_role (
  user_id bigint not null references core.app_user(id),
  role_id bigint not null references core.role(id),
  primary key (user_id, role_id)
);

create table if not exists core.menu_item (
  id bigserial primary key,
  code varchar(64) unique not null,
  label varchar(128) not null,
  route varchar(256) not null,
  parent_code varchar(64),
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists core.menu_permission (
  menu_code varchar(64) not null,
  permission_code varchar(128) not null,
  primary key (menu_code, permission_code)
);

create table if not exists mig.import_batch (
  id bigserial primary key,
  source_system varchar(32) not null default 'DBF',
  source_table varchar(64) not null,
  status varchar(32) not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_rows int,
  success_rows int,
  error_rows int
);
