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
@Table(name = "dalal_payment_1_vouchers", schema = "txn")
public class DalalPayment1Voucher {
    @Id
    private java.util.UUID id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 50)
    private String voucherNo;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "token_no", length = 50)
    private String tokenNo;

    @Column(name = "rtgs_after_1pm")
    private Boolean rtgsAfter1PM = false;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "by_hand")
    private String byHand;

    @Column(name = "party_address", columnDefinition = "TEXT")
    private String partyAddress;

    @Column(name = "balance", precision = 12, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "crate_amt", precision = 12, scale = 2)
    private BigDecimal crateAmt = BigDecimal.ZERO;

    @Column(name = "rtgs_charges", precision = 12, scale = 2)
    private BigDecimal rtgsCharges = BigDecimal.ZERO;

    @Column(name = "party_bank")
    private String partyBank;

    @Column(name = "mode")
    private String mode;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "cheque_dd_no")
    private String chequeDdNo;

    @Column(name = "rtgs_date")
    private String rtgsDate;

    @Column(name = "cash_amount", precision = 12, scale = 2)
    private BigDecimal cashAmount = BigDecimal.ZERO;

    @Column(name = "dd_commission", precision = 12, scale = 2)
    private BigDecimal ddCommission = BigDecimal.ZERO;

    @Column(name = "selected_quick_bank")
    private String selectedQuickBank;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DalalPayment1Detail> paymentDetails = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
