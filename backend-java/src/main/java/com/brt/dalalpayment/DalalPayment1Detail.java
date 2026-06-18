package com.brt.dalalpayment;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "dalal_payment_1_details", schema = "txn")
public class DalalPayment1Detail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    @JsonIgnore
    private DalalPayment1Voucher voucher;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "farmer_id")
    private Long farmerId;

    @Column(name = "patti_no")
    private String pattiNo;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "tds_rs", precision = 12, scale = 2)
    private BigDecimal tdsRs = BigDecimal.ZERO;

    @Column(name = "cheque_no")
    private String chequeNo;

    @Column(name = "narration")
    private String narration;
}
