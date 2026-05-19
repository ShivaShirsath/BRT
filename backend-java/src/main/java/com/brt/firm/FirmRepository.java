package com.brt.firm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FirmRepository extends JpaRepository<Firm, Long> {
  List<Firm> findByActiveTrueOrderByNameAsc();
}
