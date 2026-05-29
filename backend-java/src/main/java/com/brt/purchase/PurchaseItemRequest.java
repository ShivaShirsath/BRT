package com.brt.purchase;

import java.math.BigDecimal;

public record PurchaseItemRequest(
  String commodity,
  String mark,
  String brand,
  Integer bags,
  BigDecimal avgWt,
  BigDecimal purWt,
  BigDecimal packingWeight,
  BigDecimal netWt,
  BigDecimal rate
) {}
