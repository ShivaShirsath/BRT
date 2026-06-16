package com.brt.misc_receipt;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MiscReceiptService {
    private final MiscReceiptRepository repository;

    public MiscReceiptService(MiscReceiptRepository repository) {
        this.repository = repository;
    }

    public MiscReceipt createOrUpdate(MiscReceiptRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<MiscReceipt> existing = repository.findById(id);
            if (existing.isPresent()) {
                repository.delete(existing.get());
                repository.flush();
            }
        }

        MiscReceipt r = new MiscReceipt();
        r.setId(id);
        r.setVoucherNo(req.voucherNo().trim());
        r.setVoucherSuffix(req.voucherSuffix() != null ? req.voucherSuffix().trim() : null);
        r.setBusinessDate(req.date());
        r.setAccountType(req.accountType());
        r.setLedgerAccount(req.ledgerAccount());
        r.setCustomerId(req.customerId());
        r.setBalance(req.balance());
        r.setAmount(req.amount());
        r.setInterestPercent(req.interestPercent());
        r.setDiscount(req.discount());
        r.setTdsAmount(req.tdsAmount());
        r.setDepositedIn(req.depositedIn());
        r.setPaymentMode(req.paymentMode());
        r.setPaymentModeDetails(req.paymentModeDetails());
        r.setChqOfBank(req.chqOfBank());
        r.setNarration(req.narration());

        return repository.save(r);
    }

    public List<MiscReceipt> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<MiscReceipt> getByVoucherNo(String voucherNo) {
        return repository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteByVoucherNo(String voucherNo) {
        repository.findByVoucherNo(voucherNo.trim()).ifPresent(repository::delete);
    }
}
