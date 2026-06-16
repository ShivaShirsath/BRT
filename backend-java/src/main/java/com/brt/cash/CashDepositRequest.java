package com.brt.cash;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.Map;

public record CashDepositRequest(
    UUID id,
    String voucherNo,
    LocalDate date,
    String createdBy,
    String bankAccount,
    BigDecimal amount,
    String narration,
    Map<String, Integer> denominations
) {}
