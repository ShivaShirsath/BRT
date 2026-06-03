package com.brt.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalePattiRepository extends JpaRepository<SalePatti, java.util.UUID> {
    List<SalePatti> findTop20ByOrderByCreatedAtDesc();
    java.util.Optional<SalePatti> findBySalePattiNo(String salePattiNo);
}

