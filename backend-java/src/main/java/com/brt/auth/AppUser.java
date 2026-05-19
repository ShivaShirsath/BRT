package com.brt.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user", schema = "core", uniqueConstraints = @UniqueConstraint(columnNames = {"firm_id", "user_code"}))
public class AppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "firm_id", nullable = false, length = 32)
  private String firmId;

  @Column(name = "user_code", nullable = false, length = 64)
  private String userCode;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "full_name", length = 128)
  private String fullName;

  @Column(name = "role_code", nullable = false, length = 32)
  private String roleCode;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  public Long getId() { return id; }
  public String getFirmId() { return firmId; }
  public void setFirmId(String firmId) { this.firmId = firmId; }
  public String getUserCode() { return userCode; }
  public void setUserCode(String userCode) { this.userCode = userCode; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public String getRoleCode() { return roleCode; }
  public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
