package com.brt.payment_voucher;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaymentVoucherService {
    private final PaymentVoucherRepository repository;

    public PaymentVoucherService(PaymentVoucherRepository repository) {
        this.repository = repository;
    }

    public PaymentVoucher createOrUpdate(PaymentVoucherRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<PaymentVoucher> existing = repository.findById(id);
            if (existing.isPresent()) {
                repository.delete(existing.get());
                repository.flush();
            }
        }

        PaymentVoucher v = new PaymentVoucher();
        v.setId(id);
        v.setVoucherNo(req.voucherNo().trim());
        v.setVoucherSuffix(req.voucherSuffix() != null ? req.voucherSuffix().trim() : null);
        v.setBusinessDate(req.date());
        v.setCostCenter(req.costCenter());
        v.setAccountType(req.accountType());
        v.setLedgerAccount(req.ledgerAccount());
        v.setCustomerId(req.customerId());
        v.setBalanceAmount(req.balanceAmount());
        v.setAmount(req.amount());
        v.setInterestPercent(req.interestPercent());
        v.setBankCharges(req.bankCharges());
        v.setDiscount(req.discount());
        v.setTdsAmount(req.tdsAmount());
        v.setPaidFrom(req.paidFrom());
        v.setPaymentMode(req.paymentMode());
        v.setPaymentModeDetails(req.paymentModeDetails());
        v.setChqOfBank(req.chqOfBank());
        v.setNarration(req.narration());
        v.setImageData(req.imageData());

        if (req.allocations() != null) {
            for (PaymentVoucherRequest.AllocationRowRequest aReq : req.allocations()) {
                if (aReq.date() == null || aReq.date().trim().isEmpty()) {
                    continue;
                }
                PaymentVoucherAllocation allocation = new PaymentVoucherAllocation();
                allocation.setVoucher(v);
                allocation.setAllocationDate(aReq.date());
                allocation.setAmount(aReq.amount());
                v.getAllocations().add(allocation);
            }
        }

        return repository.save(v);
    }

    public List<PaymentVoucher> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<PaymentVoucher> getByVoucherNo(String voucherNo) {
        return repository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteByVoucherNo(String voucherNo) {
        repository.findByVoucherNo(voucherNo.trim()).ifPresent(repository::delete);
    }
}
