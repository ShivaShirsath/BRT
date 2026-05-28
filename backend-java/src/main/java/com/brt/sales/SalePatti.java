package com.brt.sales;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "sale_patti", schema = "txn")
public class SalePatti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sale_patti_no", unique = true, length = 50)
    private String salePattiNo;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "sales_completed")
    private Boolean salesCompleted = false;

    @Column(name = "transporter_id")
    private Long transporterId;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "salePatti", cascade = CascadeType.ALL, orphanRemoval = true)
    private SalePattiDetail detail;

    @OneToMany(mappedBy = "salePatti", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalePattiItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "salePatti", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalePattiAdjustment> adjustments = new ArrayList<>();

    @OneToOne(mappedBy = "salePatti", cascade = CascadeType.ALL, orphanRemoval = true)
    private SalePattiTotal totals;

    @OneToOne(mappedBy = "salePatti", cascade = CascadeType.ALL, orphanRemoval = true)
    private SalePattiTransporter transporter;
}

