package com.brt.purchase;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "purchase", schema = "txn")
public class Purchase {
  @Id
  private java.util.UUID id;
  @Column(name = "firm_id", nullable = false) private String firmId;
  @Column(name = "voucher_no", nullable = false) private String voucherNo;
  @Column(name = "business_date", nullable = false) private LocalDate businessDate;
  @Column(name = "supplier_acno", nullable = false) private String supplierAcno;
  @Column(name = "item_code", nullable = false) private String itemCode;
  @Column(nullable = false) private BigDecimal qty;
  @Column(nullable = false) private BigDecimal rate;
  @Column(nullable = false) private BigDecimal amount;
  @Column(name = "created_by", nullable = false) private String createdBy;
  @Column(name = "created_at", nullable = false) private OffsetDateTime createdAt;
}
