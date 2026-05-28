package com.brt.purchase;

import com.brt.product.Product;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase_bill_items", schema = "txn")
public class PurchaseBillItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_bill_id", nullable = false)
    private PurchaseBill purchaseBill;

    @Column(name = "item_no")
    private Integer itemNo;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "mark")
    private String mark;

    @Column(name = "brand")
    private String brand;

    @Column(name = "bags")
    private String bags;

    @Column(name = "avg_weight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal avgWeight = BigDecimal.ZERO;

    @Column(name = "purchase_weight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal purchaseWeight = BigDecimal.ZERO;

    @Column(name = "packing_weight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal packingWeight = BigDecimal.ZERO;

    @Column(name = "net_weight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal netWeight = BigDecimal.ZERO;

    @Column(name = "rate", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "amount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

