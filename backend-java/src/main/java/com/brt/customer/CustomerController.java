package com.brt.customer;

import com.brt.security.JwtPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public List<Customer> getAll(@AuthenticationPrincipal JwtPrincipal principal,
                                 @RequestParam(value = "search", required = false) String search) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        return customerService.getCustomers(principal.firmCode(), search);
    }

    @PostMapping
    public Customer create(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody Customer customer) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        customer.setFirmId(principal.firmCode());
        return customerService.saveCustomer(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@AuthenticationPrincipal JwtPrincipal principal,
                           @PathVariable Long id,
                           @RequestBody Customer customer) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        Customer existing = customerService.getCustomerById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (!existing.getFirmId().equals(principal.firmCode())) {
            throw new IllegalArgumentException("Access Denied");
        }
        customer.setId(id);
        customer.setFirmId(principal.firmCode());
        return customerService.saveCustomer(customer);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable Long id) {
        if (principal == null) throw new IllegalArgumentException("Unauthorized");
        Customer existing = customerService.getCustomerById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (!existing.getFirmId().equals(principal.firmCode())) {
            throw new IllegalArgumentException("Access Denied");
        }
        customerService.deleteCustomer(id);
        return Map.of("success", true);
    }
}
