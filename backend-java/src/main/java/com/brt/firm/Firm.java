package com.brt.firm;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "firm", schema = "core")
public class Firm {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 32)
  private String code;

  @Column(nullable = false, length = 128)
  private String name;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Column(name = "book_start_date")
  private LocalDate bookStartDate;

  @Column(name = "business_type", length = 64)
  private String businessType;

  @Column(name = "financial_year", length = 32)
  private String financialYear;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }

  public LocalDate getBookStartDate() { return bookStartDate; }
  public void setBookStartDate(LocalDate bookStartDate) { this.bookStartDate = bookStartDate; }

  public String getBusinessType() { return businessType; }
  public void setBusinessType(String businessType) { this.businessType = businessType; }

  public String getFinancialYear() { return financialYear; }
  public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }
}
