package com.brt.cash;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CashWithdrawalRepository extends JpaRepository<CashWithdrawal, UUID> {
    Optional<CashWithdrawal> findByVoucherNo(String voucherNo);
    List<CashWithdrawal> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM CashWithdrawal w WHERE w.bankAccount = :bankAccount")
    BigDecimal sumAmountByBankAccount(@Param("bankAccount") String bankAccount);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM CashWithdrawal w WHERE w.bankAccount = :bankAccount AND w.id != :excludeId")
    BigDecimal sumAmountByBankAccountExcludingId(@Param("bankAccount") String bankAccount, @Param("excludeId") UUID excludeId);
}
