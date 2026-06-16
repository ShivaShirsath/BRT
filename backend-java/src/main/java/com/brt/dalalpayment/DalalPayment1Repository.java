package com.brt.dalalpayment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface DalalPayment1Repository extends JpaRepository<DalalPayment1Voucher, UUID> {
    Optional<DalalPayment1Voucher> findByVoucherNo(String voucherNo);
    List<DalalPayment1Voucher> findAllByOrderByCreatedAtDesc();
}
