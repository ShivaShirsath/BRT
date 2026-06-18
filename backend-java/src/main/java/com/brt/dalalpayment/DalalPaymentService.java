package com.brt.dalalpayment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DalalPaymentService {
    private final DalalPaymentRepository repository;

    public DalalPaymentService(DalalPaymentRepository repository) {
        this.repository = repository;
    }

    public DalalPaymentVoucher createOrUpdate(DalalPaymentRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<DalalPaymentVoucher> existing = repository.findById(id);
            if (existing.isPresent()) {
                repository.delete(existing.get());
                repository.flush();
            }
        }

        DalalPaymentVoucher v = new DalalPaymentVoucher();
        v.setId(id);
        v.setBillNo(req.billNo().trim());
        v.setBusinessDate(req.date());
        v.setLedgerAccount(req.ledgerAccount());
        v.setCustomerId(req.customerId());
        v.setBalanceAmount(req.balanceAmount());
        v.setAmount(req.amount());
        v.setPaidFrom(req.paidFrom());
        v.setMode(req.mode());
        v.setRefNo(req.refNo());
        v.setDiscount(req.discount());
        v.setBankCharges(req.bankCharges());
        v.setTdsAmount(req.tdsAmount());
        v.setComm(req.comm());
        v.setNarration(req.narration());
        v.setSelectedBank(req.selectedBank());

        if (req.allocations() != null) {
            for (DalalPaymentRequest.AllocationRowRequest allocReq : req.allocations()) {
                if (allocReq.date() == null || allocReq.date().isEmpty()) {
                    continue;
                }
                DalalPaymentAllocation allocation = new DalalPaymentAllocation();
                allocation.setVoucher(v);
                allocation.setAllocationDate(allocReq.date());
                allocation.setActAmount(allocReq.actAmount());
                allocation.setBalAmount(allocReq.balAmount());
                allocation.setNo(allocReq.no());
                v.getAllocations().add(allocation);
            }
        }

        return repository.save(v);
    }

    public List<DalalPaymentVoucher> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<DalalPaymentVoucher> getByBillNo(String billNo) {
        return repository.findByBillNo(billNo.trim());
    }

    public void deleteByBillNo(String billNo) {
        repository.findByBillNo(billNo.trim()).ifPresent(repository::delete);
    }
}
