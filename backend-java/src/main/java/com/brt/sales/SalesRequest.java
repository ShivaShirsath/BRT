package com.brt.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesRequest(
  @NotBlank String voucherNo,
  @NotNull LocalDate businessDate,
  @NotBlank String customerAcno,
  @NotBlank String itemCode,
  @NotNull @DecimalMin("0.001") BigDecimal qty,
  @NotNull @DecimalMin("0.00") BigDecimal rate
) {}

