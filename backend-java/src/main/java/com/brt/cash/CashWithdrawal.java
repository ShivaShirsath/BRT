package com.brt.cash;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cash_withdrawals", schema = "txn")
public class CashWithdrawal {
    @Id
    private java.util.UUID id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 50)
    private String voucherNo;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "current_balance", precision = 12, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "ref_no", length = 100)
    private String refNo;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @Column(name = "denominations_json", columnDefinition = "TEXT")
    private String denominationsJson;

    @Column(name = "quick_bank", length = 100)
    private String quickBank;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
