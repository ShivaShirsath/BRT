package com.brt.receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomerReceiptRequest(
    UUID id,
    String voucherNo,
    LocalDate date,
    Boolean receivedAsDeposit,
    String customerName,
    Long customerId,
    BigDecimal balance,
    BigDecimal amount,
    BigDecimal discount,
    BigDecimal billDifference,
    BigDecimal tdsAmount,
    BigDecimal tcsPercent,
    BigDecimal tcsTotal,
    String depositedIn,
    String bankChqDetails,
    BigDecimal bankCharges,
    String narration,
    List<AllocationRowRequest> allocations
) {
    public record AllocationRowRequest(
        String date,
        String billNo,
        BigDecimal amount,
        BigDecimal settled
    ) {}
}
