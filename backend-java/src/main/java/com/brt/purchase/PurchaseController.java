package com.brt.purchase;

import com.brt.security.JwtPrincipal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/purchase")
public class PurchaseController {
  public record PurchaseRequest(
    @NotBlank String voucherNo,
    @NotNull LocalDate businessDate,
    @NotBlank String supplierAcno,
    @NotBlank String itemCode,
    @NotNull @DecimalMin("0.001") BigDecimal qty,
    @NotNull @DecimalMin("0.00") BigDecimal rate
  ) {}

  private final PurchaseRepository purchases;

  public PurchaseController(PurchaseRepository purchases) {
    this.purchases = purchases;
  }

  @PostMapping
  public Map<String, Object> create(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody PurchaseRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    Purchase p = new Purchase();
    p.setFirmId(principal.firmCode());
    p.setVoucherNo(req.voucherNo().trim());
    p.setBusinessDate(req.businessDate());
    p.setSupplierAcno(req.supplierAcno().trim().toUpperCase());
    p.setItemCode(req.itemCode().trim().toUpperCase());
    p.setQty(req.qty());
    p.setRate(req.rate());
    p.setAmount(req.qty().multiply(req.rate()));
    p.setCreatedBy(principal.userCode());
    p.setCreatedAt(OffsetDateTime.now());
    purchases.save(p);
    return Map.of("id", p.getId(), "voucherNo", p.getVoucherNo(), "amount", p.getAmount());
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", purchases.findTop20ByFirmIdOrderByIdDesc(principal.firmCode()).stream().map(p -> Map.of(
      "id", p.getId(), "voucherNo", p.getVoucherNo(), "amount", p.getAmount()
    )).toList());
  }
}
