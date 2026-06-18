package com.brt.dalalpayment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DalalPaymentRequest(
    UUID id,
    String billNo,
    LocalDate date,
    String ledgerAccount,
    Long customerId,
    BigDecimal balanceAmount,
    BigDecimal amount,
    String paidFrom,
    String mode,
    String refNo,
    BigDecimal discount,
    BigDecimal bankCharges,
    BigDecimal tdsAmount,
    BigDecimal comm,
    String narration,
    String selectedBank,
    List<AllocationRowRequest> allocations
) {
    public record AllocationRowRequest(
        String date,
        BigDecimal actAmount,
        BigDecimal balAmount,
        String no
    ) {}
}
