package com.brt.payment_voucher;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payment_voucher_allocations", schema = "txn")
public class PaymentVoucherAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    @JsonIgnore
    private PaymentVoucher voucher;

    @Column(name = "allocation_date", length = 100)
    private String allocationDate;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;
}
