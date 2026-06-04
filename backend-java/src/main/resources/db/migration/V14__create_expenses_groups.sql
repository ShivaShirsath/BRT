CREATE TABLE IF NOT EXISTS mst.expenses_groups (
    id BIGSERIAL PRIMARY KEY,
    rate_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    valid_from DATE,
    valid_to DATE,
    bharti_bag INT DEFAULT 0,

    -- Farmer commission settings
    farmer_comm_pct NUMERIC(12,4) DEFAULT 0,
    farmer_cess_pct NUMERIC(12,4) DEFAULT 0,
    farmer_sup_fee_pct NUMERIC(12,4) DEFAULT 0,
    farmer_charge_pct NUMERIC(12,4) DEFAULT 0,
    farmer_vat_pct NUMERIC(12,4) DEFAULT 0,
    farmer_packing_chrg NUMERIC(12,4) DEFAULT 0,
    farmer_rate_per NUMERIC(12,4) DEFAULT 1,
    farmer_details VARCHAR(255),

    -- Customer commission settings
    customer_comm_pct NUMERIC(12,4) DEFAULT 0,
    customer_cess_pct NUMERIC(12,4) DEFAULT 0,
    customer_sup_fee_pct NUMERIC(12,4) DEFAULT 0,
    customer_charge_pct NUMERIC(12,4) DEFAULT 0,
    customer_vat_pct NUMERIC(12,4) DEFAULT 0,
    customer_packing_chrg NUMERIC(12,4) DEFAULT 0,
    customer_rate_per NUMERIC(12,4) DEFAULT 1,
    customer_details VARCHAR(255),

    -- Hamali, Tolai, Bharai, Mapai details
    hamali_on VARCHAR(50) DEFAULT 'Farmer',
    hamali_rs NUMERIC(12,4) DEFAULT 0,
    hamali_per NUMERIC(12,4) DEFAULT 0,
    hamali_cust_rs NUMERIC(12,4) DEFAULT 0,

    tolai_on VARCHAR(50) DEFAULT 'Farmer',
    tolai_rs NUMERIC(12,4) DEFAULT 0,
    tolai_per NUMERIC(12,4) DEFAULT 0,
    tolai_cust_rs NUMERIC(12,4) DEFAULT 0,

    bharai_on VARCHAR(50) DEFAULT 'Farmer',
    bharai_rs NUMERIC(12,4) DEFAULT 0,
    bharai_per NUMERIC(12,4) DEFAULT 0,
    bharai_cust_rs NUMERIC(12,4) DEFAULT 0,

    mapai_on VARCHAR(50) DEFAULT 'Farmer',
    mapai_rs NUMERIC(12,4) DEFAULT 0,
    mapai_per NUMERIC(12,4) DEFAULT 0,
    mapai_cust_rs NUMERIC(12,4) DEFAULT 0,

    -- Octroi, Varai, Crate, Discount
    octrio_rate NUMERIC(12,4) DEFAULT 0,
    varai_rate NUMERIC(12,4) DEFAULT 0,
    packed_in_crate VARCHAR(10) DEFAULT 'No',
    crate_exp NUMERIC(12,4) DEFAULT 0,

    farmer_weight_disc NUMERIC(12,4) DEFAULT 0,
    up_to_weight NUMERIC(12,4) DEFAULT 0,
    more_than NUMERIC(12,4) DEFAULT 0,
    discount_weight NUMERIC(12,4) DEFAULT 0,

    -- Account references
    purchase_ac VARCHAR(255),
    sale_ac VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mst.products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    marathi_name VARCHAR(255),
    english_name VARCHAR(255),
    bharti_weight NUMERIC(12,2) DEFAULT 0,
    gst_item_code VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mst.product_expense_groups (
    product_id BIGINT NOT NULL,
    expense_group_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, expense_group_id),
    CONSTRAINT fk_peg_product FOREIGN KEY (product_id) REFERENCES mst.products(id) ON DELETE CASCADE,
    CONSTRAINT fk_peg_expense_group FOREIGN KEY (expense_group_id) REFERENCES mst.expenses_groups(id) ON DELETE CASCADE
);
