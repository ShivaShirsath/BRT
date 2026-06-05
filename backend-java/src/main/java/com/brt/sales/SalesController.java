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

  @PostMapping("/bulk")
  public Map<String, Object> createBulk(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody java.util.List<SalesRequest> reqs) {
    java.util.List<Map<String, Object>> results = salesService.createBulk(principal, reqs);
    return Map.of("results", results);
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", salesService.recent().stream().map(patti -> Map.of(
      "id", patti.getId(), "salePattiNo", patti.getSalePattiNo(),
      "amount", patti.getTotals() != null ? patti.getTotals().getPattiNetTotal() : null
    )).toList());
  }

  @GetMapping("/by-patti-no/{pattiNo}")
  public Map<String, Object> getByPattiNo(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String pattiNo) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    Map<String, Object> details = salesService.getSalePattiDetailsByNo(pattiNo);
    return details != null ? details : Map.of();
  }

  @GetMapping("/all")
  public Map<String, Object> getAll(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", salesService.getAll().stream().map(patti -> Map.of(
      "id", patti.getId(),
      "salePattiNo", patti.getSalePattiNo(),
      "date", patti.getDetail() != null && patti.getDetail().getPattiDate() != null ? patti.getDetail().getPattiDate().toString() : "",
      "amount", patti.getTotals() != null ? patti.getTotals().getPattiNetTotal() : null
    )).toList());
  }
}
