package com.brt.purchase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface PurchaseBillRepository extends JpaRepository<PurchaseBill, java.util.UUID> {
  List<PurchaseBill> findTop20ByOrderByCreatedAtDesc();
  List<PurchaseBill> findAllByOrderByCreatedAtDesc();
  Optional<PurchaseBill> findByBillNo(String billNo);
}

