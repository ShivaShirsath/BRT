package com.brt.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesRequest(
  java.util.UUID id,
  @NotBlank String voucherNo,
  @NotNull LocalDate businessDate,
  String customerAcno,
  String deliveredTo,
  String vehicleNo,
  String partyBillNo,
  String remark,
  Boolean salesCompleted,
  @NotNull @Valid List<ItemRow> items
) {
  public record ItemRow(
    String bookDate,
    String pattiNo,
    String pattiDate,
    Integer bags,
    BigDecimal pattiWt,
    BigDecimal pattiFreight,
    BigDecimal commission,
    BigDecimal tdsPercent,
    BigDecimal tdsAmount,
    BigDecimal pattiNet
  ) {}
}
