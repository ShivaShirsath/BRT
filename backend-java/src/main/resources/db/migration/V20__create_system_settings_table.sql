-- V20__create_system_settings_table.sql
-- Generic key-value table to store system configurations like default crops, charges, and taxes.

CREATE TABLE IF NOT EXISTS mst.system_settings (
    setting_key varchar(255) primary key,
    setting_value text not null
);
