package com.brt.receipt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CustomerReceiptRepository extends JpaRepository<CustomerReceipt, UUID> {
    Optional<CustomerReceipt> findByVoucherNo(String voucherNo);
    List<CustomerReceipt> findAllByOrderByCreatedAtDesc();
}
