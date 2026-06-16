package com.brt.receipt;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CustomerReceiptService {
    private final CustomerReceiptRepository repository;

    public CustomerReceiptService(CustomerReceiptRepository repository) {
        this.repository = repository;
    }

    public CustomerReceipt createOrUpdate(CustomerReceiptRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<CustomerReceipt> existing = repository.findById(id);
            if (existing.isPresent()) {
                repository.delete(existing.get());
                repository.flush();
            }
        }

        CustomerReceipt r = new CustomerReceipt();
        r.setId(id);
        r.setVoucherNo(req.voucherNo().trim());
        r.setBusinessDate(req.date());
        r.setReceivedAsDeposit(req.receivedAsDeposit() != null ? req.receivedAsDeposit() : false);
        r.setCustomerName(req.customerName());
        r.setCustomerId(req.customerId());
        r.setBalance(req.balance());
        r.setAmount(req.amount());
        r.setDiscount(req.discount());
        r.setBillDifference(req.billDifference());
        r.setTdsAmount(req.tdsAmount());
        r.setTcsPercent(req.tcsPercent());
        r.setTcsTotal(req.tcsTotal());
        r.setDepositedIn(req.depositedIn());
        r.setBankChqDetails(req.bankChqDetails());
        r.setBankCharges(req.bankCharges());
        r.setNarration(req.narration());

        if (req.allocations() != null) {
            for (CustomerReceiptRequest.AllocationRowRequest aReq : req.allocations()) {
                if (aReq.date() == null || aReq.date().trim().isEmpty()) {
                    continue;
                }
                CustomerReceiptAllocation allocation = new CustomerReceiptAllocation();
                allocation.setReceipt(r);
                allocation.setAllocationDate(aReq.date());
                allocation.setBillNo(aReq.billNo());
                allocation.setAmount(aReq.amount());
                allocation.setSettled(aReq.settled());
                r.getAllocations().add(allocation);
            }
        }

        return repository.save(r);
    }

    public List<CustomerReceipt> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<CustomerReceipt> getByVoucherNo(String voucherNo) {
        return repository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteByVoucherNo(String voucherNo) {
        repository.findByVoucherNo(voucherNo.trim()).ifPresent(repository::delete);
    }
}
