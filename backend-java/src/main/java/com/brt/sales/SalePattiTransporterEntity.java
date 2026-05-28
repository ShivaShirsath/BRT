package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sale_patti_transporters", schema = "txn")
public class SalePattiTransporterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "sale_patti_id", nullable = false, unique = true)
    private SalePatti salePatti;

    @Column(name = "transporter_name", length = 255)
    private String transporterName;

    @Column(name = "party_advance", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal partyAdvance = BigDecimal.ZERO;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(name = "incentive_hour")
    private Integer incentiveHour;

    @Column(name = "incentive_minute")
    private Integer incentiveMinute;

    @Column(name = "incentive_period", length = 5)
    private String incentivePeriod; // AM / PM

    @Column(name = "lorry_no", length = 50)
    private String lorryNo;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "driver_name", length = 255)
    private String driverName;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "own_outside", length = 20)
    private String ownOutside; // OWN / OUTSIDE

    @Column(name = "amount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "extra_freight_rate", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal extraFreightRate = BigDecimal.ZERO;

    @Column(name = "brokerage", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal brokerage = BigDecimal.ZERO;

    @Column(name = "lorry_freight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal lorryFreight = BigDecimal.ZERO;

    @Column(name = "hamul", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal hamul = BigDecimal.ZERO;

    @Column(name = "coolie_advance", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal coolieAdvance = BigDecimal.ZERO;

    @Column(name = "freight_advance", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal freightAdvance = BigDecimal.ZERO;

    @Column(name = "balance_freight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal balanceFreight = BigDecimal.ZERO;

    @Column(name = "secondary_driver_name", length = 255)
    private String secondaryDriverName;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

