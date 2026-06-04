package com.brt.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByCodeIgnoreCase(String code);
    Optional<Product> findByEnglishNameIgnoreCase(String englishName);
    Optional<Product> findByMarathiNameIgnoreCase(String marathiName);

    @Query(value = "SELECT p.* FROM mst.products p " +
            "JOIN mst.product_expense_groups peg ON p.id = peg.product_id " +
            "WHERE peg.expense_group_id = :expenseGroupId ORDER BY p.code ASC", nativeQuery = true)
    List<Product> findProductsByExpenseGroupId(@Param("expenseGroupId") Long expenseGroupId);
}
