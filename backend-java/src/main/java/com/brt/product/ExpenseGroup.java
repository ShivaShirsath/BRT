package com.brt.product;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "expenses_groups", schema = "mst")
public class ExpenseGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rate_code", nullable = false, unique = true, length = 50)
    private String rateCode;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "bharti_bag")
    private Integer bhartiBag;

    // Farmer commission settings
    @Column(name = "farmer_comm_pct")
    private BigDecimal farmerCommPct;

    @Column(name = "farmer_cess_pct")
    private BigDecimal farmerCessPct;

    @Column(name = "farmer_sup_fee_pct")
    private BigDecimal farmerSupFeePct;

    @Column(name = "farmer_charge_pct")
    private BigDecimal farmerChargePct;

    @Column(name = "farmer_vat_pct")
    private BigDecimal farmerVatPct;

    @Column(name = "farmer_packing_chrg")
    private BigDecimal farmerPackingChrg;

    @Column(name = "farmer_rate_per")
    private BigDecimal farmerRatePer;

    @Column(name = "farmer_details", length = 255)
    private String farmerDetails;

    // Customer commission settings
    @Column(name = "customer_comm_pct")
    private BigDecimal customerCommPct;

    @Column(name = "customer_cess_pct")
    private BigDecimal customerCessPct;

    @Column(name = "customer_sup_fee_pct")
    private BigDecimal customerSupFeePct;

    @Column(name = "customer_charge_pct")
    private BigDecimal customerChargePct;

    @Column(name = "customer_vat_pct")
    private BigDecimal customerVatPct;

    @Column(name = "customer_packing_chrg")
    private BigDecimal customerPackingChrg;

    @Column(name = "customer_rate_per")
    private BigDecimal customerRatePer;

    @Column(name = "customer_details", length = 255)
    private String customerDetails;

    // Hamali, Tolai, Bharai, Mapai details
    @Column(name = "hamali_on")
    private String hamaliOn;

    @Column(name = "hamali_rs")
    private BigDecimal hamaliRs;

    @Column(name = "hamali_per")
    private BigDecimal hamaliPer;

    @Column(name = "hamali_cust_rs")
    private BigDecimal hamaliCustRs;

    @Column(name = "tolai_on")
    private String tolaiOn;

    @Column(name = "tolai_rs")
    private BigDecimal tolaiRs;

    @Column(name = "tolai_per")
    private BigDecimal tolaiPer;

    @Column(name = "tolai_cust_rs")
    private BigDecimal tolaiCustRs;

    @Column(name = "bharai_on")
    private String bharaiOn;

    @Column(name = "bharai_rs")
    private BigDecimal bharaiRs;

    @Column(name = "bharai_per")
    private BigDecimal bharaiPer;

    @Column(name = "bharai_cust_rs")
    private BigDecimal bharaiCustRs;

    @Column(name = "mapai_on")
    private String mapaiOn;

    @Column(name = "mapai_rs")
    private BigDecimal mapaiRs;

    @Column(name = "mapai_per")
    private BigDecimal mapaiPer;

    @Column(name = "mapai_cust_rs")
    private BigDecimal mapaiCustRs;

    // Octroi, Varai, Crate, Discount
    @Column(name = "octrio_rate")
    private BigDecimal octrioRate;

    @Column(name = "varai_rate")
    private BigDecimal varaiRate;

    @Column(name = "packed_in_crate")
    private String packedInCrate;

    @Column(name = "crate_exp")
    private BigDecimal crateExp;

    @Column(name = "farmer_weight_disc")
    private BigDecimal farmerWeightDisc;

    @Column(name = "up_to_weight")
    private BigDecimal upToWeight;

    @Column(name = "more_than")
    private BigDecimal moreThan;

    @Column(name = "discount_weight")
    private BigDecimal discountWeight;

    // Account references
    @Column(name = "purchase_ac")
    private String purchaseAc;

    @Column(name = "sale_ac")
    private String saleAc;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
