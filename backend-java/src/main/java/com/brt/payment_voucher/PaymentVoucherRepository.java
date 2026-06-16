package com.brt.payment_voucher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface PaymentVoucherRepository extends JpaRepository<PaymentVoucher, UUID> {
    Optional<PaymentVoucher> findByVoucherNo(String voucherNo);
    List<PaymentVoucher> findAllByOrderByCreatedAtDesc();
}
