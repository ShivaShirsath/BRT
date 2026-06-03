package com.brt.purchase;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "purchase_bills", schema = "txn")
public class PurchaseBill {
    @Id
    private java.util.UUID id;

    @Column(name = "bill_no", nullable = false, unique = true, length = 50)
    private String billNo;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "purchaseBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private PurchaseBillDetail detail;

    @OneToMany(mappedBy = "purchaseBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseBillItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "purchaseBill", cascade = CascadeType.ALL, orphanRemoval = true)
    private PurchaseBillChargesTaxes charges;

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

