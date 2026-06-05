package com.brt.purchase;

import com.brt.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/purchase")
public class PurchaseController {
  private final PurchaseService purchaseService;

  public PurchaseController(PurchaseService purchaseService) {
    this.purchaseService = purchaseService;
  }

  @PostMapping
  public Map<String, Object> create(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody PurchaseRequest req) {
    PurchaseBill p = purchaseService.create(principal, req);
    return Map.of("id", p.getId(), "billNo", p.getBillNo(), "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : null);
  }

  @PostMapping("/bulk")
  public Map<String, Object> createBulk(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody java.util.List<PurchaseRequest> reqs) {
    java.util.List<Map<String, Object>> results = purchaseService.createBulk(principal, reqs);
    return Map.of("results", results);
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", purchaseService.recent(principal.firmCode()).stream().map(p -> Map.of(
      "id", p.getId(), "billNo", p.getBillNo(), "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : null
    )).toList());
  }

  @GetMapping("/by-bill-no/{billNo}")
  public Map<String, Object> getByBillNo(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String billNo) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    Map<String, Object> details = purchaseService.getBillDetailsByNo(billNo);
    return details != null ? details : Map.of();
  }

  @GetMapping("/all")
  public Map<String, Object> getAll(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", purchaseService.getAll().stream().map(p -> Map.of(
      "id", p.getId(),
      "billNo", p.getBillNo(),
      "date", p.getDetail() != null ? p.getDetail().getBillDate().toString() : "",
      "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : null
    )).toList());
  }
}
