package com.brt.payment_voucher;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "payment_vouchers", schema = "txn")
public class PaymentVoucher {
    @Id
    private java.util.UUID id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 50)
    private String voucherNo;

    @Column(name = "voucher_suffix", length = 50)
    private String voucherSuffix;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "cost_center", length = 100)
    private String costCenter;

    @Column(name = "account_type", length = 100)
    private String accountType;

    @Column(name = "ledger_account")
    private String ledgerAccount;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "balance_amount", precision = 12, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "interest_percent", precision = 12, scale = 2)
    private BigDecimal interestPercent = BigDecimal.ZERO;

    @Column(name = "bank_charges", precision = 12, scale = 2)
    private BigDecimal bankCharges = BigDecimal.ZERO;

    @Column(name = "discount", precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tds_amount", precision = 12, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "paid_from")
    private String paidFrom;

    @Column(name = "payment_mode", length = 100)
    private String paymentMode;

    @Column(name = "payment_mode_details")
    private String paymentModeDetails;

    @Column(name = "chq_of_bank")
    private String chqOfBank;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "image_data", columnDefinition = "TEXT")
    private String imageData;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentVoucherAllocation> allocations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
