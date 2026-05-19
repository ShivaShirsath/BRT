package com.brt.purchase;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "purchase", schema = "txn")
public class Purchase {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
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

  public void setFirmId(String firmId) { this.firmId = firmId; }
  public void setVoucherNo(String voucherNo) { this.voucherNo = voucherNo; }
  public void setBusinessDate(LocalDate businessDate) { this.businessDate = businessDate; }
  public void setSupplierAcno(String supplierAcno) { this.supplierAcno = supplierAcno; }
  public void setItemCode(String itemCode) { this.itemCode = itemCode; }
  public void setQty(BigDecimal qty) { this.qty = qty; }
  public void setRate(BigDecimal rate) { this.rate = rate; }
  public void setAmount(BigDecimal amount) { this.amount = amount; }
  public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
  public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
  public Long getId() { return id; }
  public String getVoucherNo() { return voucherNo; }
  public BigDecimal getAmount() { return amount; }
}
