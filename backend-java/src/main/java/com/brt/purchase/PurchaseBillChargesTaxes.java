package com.brt.purchase;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase_bill_charges_taxes", schema = "txn")
public class PurchaseBillChargesTaxes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "purchase_bill_id", nullable = false, unique = true)
    private PurchaseBill purchaseBill;

    @Column(name = "purchase_amount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal purchaseAmount = BigDecimal.ZERO;

    @Column(name = "m_tax", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal mTax = BigDecimal.ZERO;

    @Column(name = "commission", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "purchase_commission", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal purchaseCommission = BigDecimal.ZERO;

    @Column(name = "freight", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal freight = BigDecimal.ZERO;

    @Column(name = "packing", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal packing = BigDecimal.ZERO;

    @Column(name = "loading", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal loading = BigDecimal.ZERO;

    @Column(name = "levy", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal levy = BigDecimal.ZERO;

    @Column(name = "tolai", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal tolai = BigDecimal.ZERO;

    @Column(name = "hamali", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal hamali = BigDecimal.ZERO;

    @Column(name = "discount", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "igst", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal igst = BigDecimal.ZERO;

    @Column(name = "sgst", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal sgst = BigDecimal.ZERO;

    @Column(name = "cgst", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal cgst = BigDecimal.ZERO;

    @Column(name = "tds", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal tds = BigDecimal.ZERO;

    @Column(name = "khandani", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal khandani = BigDecimal.ZERO;

    @Column(name = "our_expenses", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal ourExpenses = BigDecimal.ZERO;

    @Column(name = "exp_2", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal exp2 = BigDecimal.ZERO;

    @Column(name = "exp_3", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal exp3 = BigDecimal.ZERO;

    @Column(name = "exp_4", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal exp4 = BigDecimal.ZERO;

    @Column(name = "total", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "net_total", columnDefinition = "NUMERIC(12,2) DEFAULT 0")
    private BigDecimal netTotal = BigDecimal.ZERO;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

