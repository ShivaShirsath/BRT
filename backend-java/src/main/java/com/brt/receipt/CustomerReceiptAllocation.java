package com.brt.receipt;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "customer_receipt_allocations", schema = "txn")
public class CustomerReceiptAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    @JsonIgnore
    private CustomerReceipt receipt;

    @Column(name = "allocation_date")
    private String allocationDate;

    @Column(name = "bill_no")
    private String billNo;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "settled", precision = 12, scale = 2)
    private BigDecimal settled = BigDecimal.ZERO;
}
