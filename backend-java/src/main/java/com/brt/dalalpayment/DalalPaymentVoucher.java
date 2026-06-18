package com.brt.dalalpayment;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "dalal_payment_vouchers", schema = "txn")
public class DalalPaymentVoucher {
    @Id
    private java.util.UUID id;

    @Column(name = "bill_no", nullable = false, unique = true, length = 50)
    private String billNo;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "ledger_account")
    private String ledgerAccount;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "balance_amount", precision = 12, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "paid_from")
    private String paidFrom;

    @Column(name = "mode")
    private String mode;

    @Column(name = "ref_no")
    private String refNo;

    @Column(name = "discount", precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "bank_charges", precision = 12, scale = 2)
    private BigDecimal bankCharges = BigDecimal.ZERO;

    @Column(name = "tds_amount", precision = 12, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "comm", precision = 12, scale = 2)
    private BigDecimal comm = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "selected_bank")
    private String selectedBank;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DalalPaymentAllocation> allocations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
