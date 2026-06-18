package com.brt.dalalpayment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DalalPayment1Service {
    private final DalalPayment1Repository repository;

    public DalalPayment1Service(DalalPayment1Repository repository) {
        this.repository = repository;
    }

    public DalalPayment1Voucher createOrUpdate(DalalPayment1Request req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<DalalPayment1Voucher> existing = repository.findById(id);
            if (existing.isPresent()) {
                repository.delete(existing.get());
                repository.flush();
            }
        }

        DalalPayment1Voucher v = new DalalPayment1Voucher();
        v.setId(id);
        v.setVoucherNo(req.voucherNo().trim());
        v.setBusinessDate(req.date());
        v.setTokenNo(req.tokenNo());
        v.setRtgsAfter1PM(req.rtgsAfter1PM() != null ? req.rtgsAfter1PM() : false);
        v.setCreatedBy(req.createdBy());
        v.setByHand(req.byHand());
        v.setPartyAddress(req.partyAddress());
        v.setBalance(req.balance());
        v.setCrateAmt(req.crateAmt());
        v.setRtgsCharges(req.rtgsCharges());
        v.setPartyBank(req.partyBank());
        v.setMode(req.mode());
        v.setBankAccount(req.bankAccount());
        v.setChequeDdNo(req.chequeDdNo());
        v.setRtgsDate(req.rtgsDate());
        v.setCashAmount(req.cashAmount());
        v.setDdCommission(req.ddCommission());
        v.setSelectedQuickBank(req.selectedQuickBank());

        if (req.paymentDetails() != null) {
            for (DalalPayment1Request.DetailRowRequest dReq : req.paymentDetails()) {
                if (dReq.farmer() == null || dReq.farmer().trim().isEmpty()) {
                    continue;
                }
                DalalPayment1Detail detail = new DalalPayment1Detail();
                detail.setVoucher(v);
                detail.setFarmerName(dReq.farmer());
                detail.setFarmerId(dReq.farmerId());
                detail.setPattiNo(dReq.pattiNo());
                detail.setAmount(dReq.amount());
                detail.setTdsRs(dReq.tdsRs());
                detail.setChequeNo(dReq.chequeNo());
                detail.setNarration(dReq.narration());
                v.getPaymentDetails().add(detail);
            }
        }

        return repository.save(v);
    }

    public List<DalalPayment1Voucher> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<DalalPayment1Voucher> getByVoucherNo(String voucherNo) {
        return repository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteByVoucherNo(String voucherNo) {
        repository.findByVoucherNo(voucherNo.trim()).ifPresent(repository::delete);
    }
}
