package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sale_patti_items", schema = "txn")
public class SalePattiItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sale_patti_id", nullable = false)
    private SalePatti salePatti;

    @Column(name = "item_no")
    private Integer itemNo;

    @Column(name = "book_date")
    private LocalDate bookDate;

    @Column(name = "patti_no", length = 100)
    private String pattiNo;

    @Column(name = "patti_item_date")
    private LocalDate pattiItemDate;

    @Column(name = "bags")
    private Integer bags = 0;

    @Column(name = "patti_weight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal pattiWeight = BigDecimal.ZERO;

    @Column(name = "patti_freight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal pattiFreight = BigDecimal.ZERO;

    @Column(name = "commission", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "tds_percentage", columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    private BigDecimal tdsPercentage = BigDecimal.ZERO;

    @Column(name = "tds_amount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "patti_net", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal pattiNet = BigDecimal.ZERO;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

