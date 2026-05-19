package com.brt.menu;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {
  private final MenuRepository menu;

  public MenuController(MenuRepository menu) {
    this.menu = menu;
  }

  @GetMapping
  public Map<String, Object> listMenu() {
    return Map.of("items", menu.findByActiveTrueOrderBySortOrderAsc().stream().map(m -> Map.of(
      "code", m.getCode(), "label", m.getLabel(), "route", m.getRoute(), "sortOrder", m.getSortOrder()
    )).toList());
  }
}
