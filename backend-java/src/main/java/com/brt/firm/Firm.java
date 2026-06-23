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

  @Column(name = "display_name", length = 256)
  private String displayName;

  @Column(name = "address", columnDefinition = "TEXT")
  private String address;

  @Column(name = "phone", length = 32)
  private String phone;

  @Column(name = "logo", columnDefinition = "TEXT")
  private String logo;

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

  public String getDisplayName() { return displayName; }
  public void setDisplayName(String displayName) { this.displayName = displayName; }

  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getLogo() { return logo; }
  public void setLogo(String logo) { this.logo = logo; }
}
