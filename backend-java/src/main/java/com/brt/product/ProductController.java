package com.brt.product;

import com.brt.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ExpenseGroupRepository expenseGroupRepository;

    // --- Product APIs ---

    @GetMapping("/products")
    public List<Product> getAllProducts(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return productRepository.findAll();
    }

    @PostMapping("/products")
    public Product saveProduct(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody Product product) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        // Check uniqueness for new code
        if (product.getId() == null) {
            Optional<Product> existing = productRepository.findByCodeIgnoreCase(product.getCode());
            if (existing.isPresent()) {
                throw new IllegalArgumentException("Product code already exists: " + product.getCode());
            }
        }
        return productRepository.save(product);
    }

    @DeleteMapping("/products/{id}")
    public Map<String, Object> deleteProduct(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable Long id) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        productRepository.deleteById(id);
        return Map.of("success", true);
    }

    @GetMapping("/products/{id}/expense-groups")
    public List<ExpenseGroup> getExpenseGroupsForProduct(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable Long id) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return expenseGroupRepository.findByProductId(id);
    }

    // --- Expense Group APIs ---

    @GetMapping("/expense-groups")
    public List<ExpenseGroup> getAllExpenseGroups(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return expenseGroupRepository.findAll();
    }

    @PostMapping("/expense-groups")
    public ExpenseGroup saveExpenseGroup(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody ExpenseGroup group) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return expenseGroupRepository.save(group);
    }

    @DeleteMapping("/expense-groups/{id}")
    public Map<String, Object> deleteExpenseGroup(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable Long id) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        expenseGroupRepository.deleteById(id);
        return Map.of("success", true);
    }

    @GetMapping("/expense-groups/{id}/products")
    public List<Product> getProductsForExpenseGroup(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable Long id) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return productRepository.findProductsByExpenseGroupId(id);
    }

    @PostMapping("/expense-groups/{id}/products/{productId}")
    public Map<String, Object> associateProduct(@AuthenticationPrincipal JwtPrincipal principal, 
                                                @PathVariable Long id, 
                                                @PathVariable Long productId) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        expenseGroupRepository.addProductToExpenseGroup(productId, id);
        return Map.of("success", true);
    }

    @DeleteMapping("/expense-groups/{id}/products/{productId}")
    public Map<String, Object> disassociateProduct(@AuthenticationPrincipal JwtPrincipal principal, 
                                                   @PathVariable Long id, 
                                                   @PathVariable Long productId) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        expenseGroupRepository.removeProductFromExpenseGroup(productId, id);
        return Map.of("success", true);
    }
}
