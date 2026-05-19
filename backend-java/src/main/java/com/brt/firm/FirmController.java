package com.brt.firm;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/firms")
public class FirmController {
  private final FirmRepository firms;

  public FirmController(FirmRepository firms) {
    this.firms = firms;
  }

  @GetMapping
  public Map<String, Object> list() {
    return Map.of("firms", firms.findByActiveTrueOrderByNameAsc().stream().map(f -> Map.of("code", f.getCode(), "name", f.getName())).toList());
  }
}
