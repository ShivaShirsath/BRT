package com.brt.purchase;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, java.util.UUID> {
  List<Purchase> findTop20ByFirmIdOrderByCreatedAtDesc(String firmId);
}
