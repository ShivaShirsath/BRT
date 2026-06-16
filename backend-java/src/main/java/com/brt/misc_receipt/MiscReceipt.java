package com.brt.misc_receipt;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "misc_receipts", schema = "txn")
public class MiscReceipt {
    @Id
    private java.util.UUID id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 50)
    private String voucherNo;

    @Column(name = "voucher_suffix", length = 50)
    private String voucherSuffix;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "account_type", length = 100)
    private String accountType;

    @Column(name = "ledger_account")
    private String ledgerAccount;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "balance", precision = 12, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "interest_percent", precision = 12, scale = 2)
    private BigDecimal interestPercent = BigDecimal.ZERO;

    @Column(name = "discount", precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tds_amount", precision = 12, scale = 2)
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "deposited_in")
    private String depositedIn;

    @Column(name = "payment_mode", length = 100)
    private String paymentMode;

    @Column(name = "payment_mode_details")
    private String paymentModeDetails;

    @Column(name = "chq_of_bank")
    private String chqOfBank;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
