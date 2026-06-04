package com.brt.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface ExpenseGroupRepository extends JpaRepository<ExpenseGroup, Long> {
    Optional<ExpenseGroup> findByRateCode(String rateCode);

    @Query(value = "SELECT eg.* FROM mst.expenses_groups eg " +
            "JOIN mst.product_expense_groups peg ON eg.id = peg.expense_group_id " +
            "WHERE peg.product_id = :productId ORDER BY eg.valid_from DESC", nativeQuery = true)
    List<ExpenseGroup> findByProductId(@Param("productId") Long productId);

    @Query(value = "SELECT p.* FROM mst.products p " +
            "JOIN mst.product_expense_groups peg ON p.id = peg.product_id " +
            "WHERE peg.expense_group_id = :expenseGroupId ORDER BY p.code ASC", nativeQuery = true)
    List<Product> findProductsByExpenseGroupId(@Param("expenseGroupId") Long expenseGroupId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO mst.product_expense_groups (product_id, expense_group_id) VALUES (:productId, :expenseGroupId) ON CONFLICT DO NOTHING", nativeQuery = true)
    void addProductToExpenseGroup(@Param("productId") Long productId, @Param("expenseGroupId") Long expenseGroupId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM mst.product_expense_groups WHERE product_id = :productId AND expense_group_id = :expenseGroupId", nativeQuery = true)
    void removeProductFromExpenseGroup(@Param("productId") Long productId, @Param("expenseGroupId") Long expenseGroupId);
}
