package com.brt.firm;

import jakarta.persistence.*;

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

  public String getCode() { return code; }
  public String getName() { return name; }
  public boolean isActive() { return active; }
}
