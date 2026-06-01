package com.brt.purchase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface PurchaseBillRepository extends JpaRepository<PurchaseBill, Long> {
  List<PurchaseBill> findTop20ByOrderByIdDesc();
  Optional<PurchaseBill> findByBillNo(String billNo);
}

