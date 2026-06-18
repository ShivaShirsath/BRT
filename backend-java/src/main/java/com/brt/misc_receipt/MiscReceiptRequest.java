package com.brt.misc_receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MiscReceiptRequest(
    UUID id,
    String voucherNo,
    String voucherSuffix,
    LocalDate date,
    String accountType,
    String ledgerAccount,
    Long customerId,
    BigDecimal balance,
    BigDecimal amount,
    BigDecimal interestPercent,
    BigDecimal discount,
    BigDecimal tdsAmount,
    String depositedIn,
    String paymentMode,
    String paymentModeDetails,
    String chqOfBank,
    String narration
) {}
