package com.brt.purchase;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record PurchaseRequest(
  Long id,
  @NotBlank String voucherNo,
  @NotNull LocalDate businessDate,
  String entryType,
  String cessCondition,
  String supplierAcno,
  String vehicleNo,
  String partyBillNo,
  String note,
  Boolean print,
  String billReceived,
  String lockState,
  @NotEmpty List<PurchaseItemRequest> items,
  Map<String, String> charges
) {}
