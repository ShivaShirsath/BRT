package com.brt.menu;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_item", schema = "core")
public class MenuItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String code;

  @Column(nullable = false)
  private String label;

  @Column(nullable = false)
  private String route;

  @Column(name = "parent_code")
  private String parentCode;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

  @Column(name = "is_active", nullable = false)
  private boolean active;

  public String getCode() { return code; }
  public String getLabel() { return label; }
  public String getRoute() { return route; }
  public int getSortOrder() { return sortOrder; }
  public boolean isActive() { return active; }
}
