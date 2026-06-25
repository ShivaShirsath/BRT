package com.brt.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SalePattiRepository extends JpaRepository<SalePatti, java.util.UUID> {
    List<SalePatti> findTop20ByOrderByCreatedAtDesc();
    java.util.Optional<SalePatti> findBySalePattiNo(String salePattiNo);

    @Query("SELECT DISTINCT s.detail.vehicleNo FROM SalePatti s WHERE s.detail.vehicleNo IS NOT NULL AND s.detail.vehicleNo <> '' AND s.detail.vehicleNo <> '--'")
    List<String> findDistinctVehicleNumbers();

    List<SalePatti> findByDetailVehicleNoIgnoreCase(String vehicleNo);
    List<SalePatti> findByDetailCustomerId(Long customerId);
}

