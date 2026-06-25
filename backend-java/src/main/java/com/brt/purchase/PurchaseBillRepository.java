package com.brt.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

import java.util.Optional;

public interface PurchaseBillRepository extends JpaRepository<PurchaseBill, java.util.UUID> {
  List<PurchaseBill> findTop20ByOrderByCreatedAtDesc();
  List<PurchaseBill> findAllByOrderByCreatedAtDesc();
  List<PurchaseBill> findByBillNo(String billNo);

  @Query("SELECT DISTINCT p.detail.vehicleNo FROM PurchaseBill p WHERE p.detail.vehicleNo IS NOT NULL AND p.detail.vehicleNo <> '' AND p.detail.vehicleNo <> '--'")
  List<String> findDistinctVehicleNumbers();
}

