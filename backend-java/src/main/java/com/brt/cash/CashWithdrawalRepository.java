package com.brt.cash;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CashWithdrawalRepository extends JpaRepository<CashWithdrawal, UUID> {
    Optional<CashWithdrawal> findByVoucherNo(String voucherNo);
    List<CashWithdrawal> findAllByOrderByCreatedAtDesc();
}
