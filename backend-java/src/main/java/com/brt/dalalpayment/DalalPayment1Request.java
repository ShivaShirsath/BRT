package com.brt.dalalpayment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DalalPayment1Request(
    UUID id,
    String voucherNo,
    LocalDate date,
    String tokenNo,
    Boolean rtgsAfter1PM,
    String createdBy,
    String byHand,
    List<DetailRowRequest> paymentDetails,
    String partyAddress,
    BigDecimal balance,
    BigDecimal crateAmt,
    BigDecimal rtgsCharges,
    String partyBank,
    String mode,
    String bankAccount,
    String chequeDdNo,
    String rtgsDate,
    BigDecimal cashAmount,
    BigDecimal ddCommission,
    String selectedQuickBank
) {
    public record DetailRowRequest(
        String farmer,
        String pattiNo,
        BigDecimal amount,
        BigDecimal tdsRs,
        String chequeNo,
        String narration,
        Long farmerId
    ) {}
}
