package com.brt.purchase;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "purchase_bill_details", schema = "txn")
public class PurchaseBillDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "purchase_bill_id", nullable = false, unique = true)
    private PurchaseBill purchaseBill;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "entry_type", length = 100)
    private String entryType;

    @Column(name = "cess_condition", length = 100)
    private String cessCondition;

    @Column(name = "seller_id")
    private Long sellerId;

    @Column(name = "vehicle_no", length = 50)
    private String vehicleNo;

    @Column(name = "party_bill_no", length = 100)
    private String partyBillNo;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

