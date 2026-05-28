package com.brt.sales;

import com.brt.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales")
public class SalesController {
  private final SalesService salesService;

  public SalesController(SalesService salesService) {
    this.salesService = salesService;
  }

  @PostMapping
  public Map<String, Object> create(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody SalesRequest req) {
    SalePatti patti = salesService.create(principal, req);
    return Map.of("id", patti.getId(), "salePattiNo", patti.getSalePattiNo(),
                  "amount", patti.getTotals() != null ? patti.getTotals().getPattiNetTotal() : null);
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", salesService.recent().stream().map(patti -> Map.of(
      "id", patti.getId(), "salePattiNo", patti.getSalePattiNo(),
      "amount", patti.getTotals() != null ? patti.getTotals().getPattiNetTotal() : null
    )).toList());
  }
}
