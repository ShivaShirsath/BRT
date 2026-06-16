package com.brt.misc_receipt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface MiscReceiptRepository extends JpaRepository<MiscReceipt, UUID> {
    Optional<MiscReceipt> findByVoucherNo(String voucherNo);
    List<MiscReceipt> findAllByOrderByCreatedAtDesc();
}
