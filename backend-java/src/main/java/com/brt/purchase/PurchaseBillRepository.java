package com.brt.purchase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseBillRepository extends JpaRepository<PurchaseBill, Long> {
  List<PurchaseBill> findTop20ByOrderByIdDesc();
}

