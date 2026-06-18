package com.brt.receipt;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "customer_receipts", schema = "txn")
public class CustomerReceipt {
    @Id
    private java.util.UUID id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 50)
    private String voucherNo;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "received_as_deposit")
    private Boolean receivedAsDeposit = false;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "balance", precision = 12, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "discount", precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "bill_difference", precision = 12, scale = 2)
    private BigDecimal billDifference = BigDecimal.ZERO;

    @Column(name = "tds_amount", precision = 12, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "tcs_percent", precision = 12, scale = 3)
    private BigDecimal tcsPercent = BigDecimal.ZERO;

    @Column(name = "tcs_total", precision = 12, scale = 2)
    private BigDecimal tcsTotal = BigDecimal.ZERO;

    @Column(name = "deposited_in")
    private String depositedIn;

    @Column(name = "bank_chq_details")
    private String bankChqDetails;

    @Column(name = "bank_charges", precision = 12, scale = 2)
    private BigDecimal bankCharges = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerReceiptAllocation> allocations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
