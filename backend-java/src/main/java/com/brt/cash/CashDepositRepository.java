package com.brt.cash;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CashDepositRepository extends JpaRepository<CashDeposit, UUID> {
    Optional<CashDeposit> findByVoucherNo(String voucherNo);
    List<CashDeposit> findAllByOrderByCreatedAtDesc();
}
