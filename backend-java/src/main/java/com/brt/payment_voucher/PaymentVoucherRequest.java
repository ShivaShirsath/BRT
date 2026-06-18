package com.brt.payment_voucher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PaymentVoucherRequest(
    UUID id,
    String voucherNo,
    String voucherSuffix,
    LocalDate date,
    String costCenter,
    String accountType,
    String ledgerAccount,
    Long customerId,
    BigDecimal balanceAmount,
    BigDecimal amount,
    BigDecimal interestPercent,
    BigDecimal bankCharges,
    BigDecimal discount,
    BigDecimal tdsAmount,
    String paidFrom,
    String paymentMode,
    String paymentModeDetails,
    String chqOfBank,
    String narration,
    String imageData,
    List<AllocationRowRequest> allocations
) {
    public record AllocationRowRequest(
        String date,
        BigDecimal amount
    ) {}
}
