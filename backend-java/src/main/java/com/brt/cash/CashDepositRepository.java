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
public interface CashDepositRepository extends JpaRepository<CashDeposit, UUID> {
    Optional<CashDeposit> findByVoucherNo(String voucherNo);
    List<CashDeposit> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM CashDeposit d WHERE d.bankAccount = :bankAccount")
    BigDecimal sumAmountByBankAccount(@Param("bankAccount") String bankAccount);
}
