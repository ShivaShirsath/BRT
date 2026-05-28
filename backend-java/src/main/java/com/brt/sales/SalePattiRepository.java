package com.brt.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalePattiRepository extends JpaRepository<SalePatti, Long> {
    List<SalePatti> findTop20ByOrderByIdDesc();
}

