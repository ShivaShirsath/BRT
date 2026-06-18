package com.brt.dalalpayment;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "dalal_payment_allocations", schema = "txn")
public class DalalPaymentAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    @JsonIgnore
    private DalalPaymentVoucher voucher;

    @Column(name = "allocation_date")
    private String allocationDate;

    @Column(name = "act_amount", precision = 12, scale = 2)
    private BigDecimal actAmount = BigDecimal.ZERO;

    @Column(name = "bal_amount", precision = 12, scale = 2)
    private BigDecimal balAmount = BigDecimal.ZERO;

    @Column(name = "no")
    private String no;
}
