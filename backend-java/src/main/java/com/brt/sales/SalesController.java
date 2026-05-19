package com.brt.sales;

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
@RequestMapping("/api/v1/sales")
public class SalesController {
  public record SalesRequest(
    @NotBlank String voucherNo,
    @NotNull LocalDate businessDate,
    @NotBlank String customerAcno,
    @NotBlank String itemCode,
    @NotNull @DecimalMin("0.001") BigDecimal qty,
    @NotNull @DecimalMin("0.00") BigDecimal rate
  ) {}

  private final SaleRepository sales;

  public SalesController(SaleRepository sales) {
    this.sales = sales;
  }

  @PostMapping
  public Map<String, Object> create(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody SalesRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    Sale s = new Sale();
    s.setFirmId(principal.firmCode());
    s.setVoucherNo(req.voucherNo().trim());
    s.setBusinessDate(req.businessDate());
    s.setCustomerAcno(req.customerAcno().trim().toUpperCase());
    s.setItemCode(req.itemCode().trim().toUpperCase());
    s.setQty(req.qty());
    s.setRate(req.rate());
    s.setAmount(req.qty().multiply(req.rate()));
    s.setCreatedBy(principal.userCode());
    s.setCreatedAt(OffsetDateTime.now());
    sales.save(s);
    return Map.of("id", s.getId(), "voucherNo", s.getVoucherNo(), "amount", s.getAmount());
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", sales.findTop20ByFirmIdOrderByIdDesc(principal.firmCode()).stream().map(s -> Map.of(
      "id", s.getId(), "voucherNo", s.getVoucherNo(), "amount", s.getAmount()
    )).toList());
  }
}
