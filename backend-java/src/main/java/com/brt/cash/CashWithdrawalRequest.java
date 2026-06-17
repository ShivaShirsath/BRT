package com.brt.cash;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.Map;

public record CashWithdrawalRequest(
    UUID id,
    String voucherNo,
    LocalDate businessDate,
    String createdBy,
    String bankAccount,
    BigDecimal currentBalance,
    BigDecimal amount,
    String refNo,
    String narration,
    Map<String, Integer> denominations,
    String quickBank
) {}
