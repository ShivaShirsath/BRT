package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sale_patti_adjustments", schema = "txn")
public class SalePattiAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sale_patti_id", nullable = false)
    private SalePatti salePatti;

    @Column(name = "adjustment_type", length = 20)
    private String adjustmentType; // PLUS / MINUS

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "amount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal amount = BigDecimal.ZERO;


    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

