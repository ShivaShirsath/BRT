package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sale_patti_details", schema = "txn")
public class SalePattiDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "sale_patti_id", nullable = false, unique = true)
    private SalePatti salePatti;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "vehicle_no", length = 50)
    private String vehicleNo;

    @Column(name = "party_bill_no", length = 100)
    private String partyBillNo;

    @Column(name = "patti_date")
    private LocalDate pattiDate;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}

