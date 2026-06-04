package com.brt.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByFirmId(String firmId);
    List<Customer> findByFirmIdAndNameContainingIgnoreCase(String firmId, String name);
}
