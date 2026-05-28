package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sale_patti_totals", schema = "txn")
public class SalePattiTotalEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "sale_patti_id", nullable = false, unique = true)
    private SalePatti salePatti;

    @Column(name = "as_per_challan", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal asPerChallan = BigDecimal.ZERO;

    @Column(name = "total_adjustment", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal totalAdjustment = BigDecimal.ZERO;

    @Column(name = "patti_net_total", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal pattiNetTotal = BigDecimal.ZERO;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

