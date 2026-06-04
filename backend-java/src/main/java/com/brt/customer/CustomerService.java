package com.brt.customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getCustomers(String firmId, String nameSearch) {
        if (nameSearch != null && !nameSearch.trim().isEmpty()) {
            return customerRepository.findByFirmIdAndNameContainingIgnoreCase(firmId, nameSearch.trim());
        }
        return customerRepository.findByFirmId(firmId);
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
}
