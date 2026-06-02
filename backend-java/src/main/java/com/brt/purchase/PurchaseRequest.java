package com.brt.purchase;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseRequest(
  java.util.UUID id,
  @NotBlank String voucherNo,
  @NotNull LocalDate businessDate,
  String entryType,
  String cessCondition,
  Long sellerId,
  String vehicleNo,
  String partyBillNo,
  String note,
  @NotNull @Valid List<ItemRow> items,
  @NotNull @Valid ChargesRequest charges
) {
  public record ItemRow(
    @NotBlank String commodity,
    String mark,
    String brand,
    String bags,
    BigDecimal avgWeight,
    BigDecimal purchaseWeight,
    BigDecimal packingWeight,
    BigDecimal netWeight,
    BigDecimal rate,
    BigDecimal amount
  ) {}

  public record ChargesRequest(
    BigDecimal purchaseAmount,
    BigDecimal mTax,
    BigDecimal commission,
    BigDecimal purchaseCommission,
    BigDecimal freight,
    BigDecimal packing,
    BigDecimal loading,
    BigDecimal levy,
    BigDecimal tolai,
    BigDecimal hamali,
    BigDecimal discount,
    BigDecimal igst,
    BigDecimal sgst,
    BigDecimal cgst,
    BigDecimal tds,
    BigDecimal khandani,
    BigDecimal ourExpenses,
    BigDecimal exp2,
    BigDecimal exp3,
    BigDecimal exp4,
    BigDecimal total,
    BigDecimal netTotal
  ) {}
}
