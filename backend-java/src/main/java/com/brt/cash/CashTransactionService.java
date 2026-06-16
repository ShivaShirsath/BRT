package com.brt.cash;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CashTransactionService {
    private final CashDepositRepository depositRepository;
    private final CashWithdrawalRepository withdrawalRepository;
    private final ObjectMapper objectMapper;

    public CashTransactionService(CashDepositRepository depositRepository,
                                  CashWithdrawalRepository withdrawalRepository,
                                  ObjectMapper objectMapper) {
        this.depositRepository = depositRepository;
        this.withdrawalRepository = withdrawalRepository;
        this.objectMapper = objectMapper;
    }

    // Cash Deposit CRUD
    public CashDeposit createDeposit(CashDepositRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<CashDeposit> existing = depositRepository.findById(id);
            if (existing.isPresent()) {
                depositRepository.delete(existing.get());
                depositRepository.flush();
            }
        }

        CashDeposit d = new CashDeposit();
        d.setId(id);
        d.setVoucherNo(req.voucherNo().trim());
        d.setBusinessDate(req.date());
        d.setCreatedBy(req.createdBy());
        d.setBankAccount(req.bankAccount());
        d.setAmount(req.amount());
        d.setNarration(req.narration());

        try {
            d.setDenominationsJson(objectMapper.writeValueAsString(req.denominations()));
        } catch (Exception e) {
            d.setDenominationsJson("{}");
        }

        return depositRepository.save(d);
    }

    public List<CashDeposit> getAllDeposits() {
        return depositRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<CashDeposit> getDepositByVoucherNo(String voucherNo) {
        return depositRepository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteDepositByVoucherNo(String voucherNo) {
        depositRepository.findByVoucherNo(voucherNo.trim()).ifPresent(depositRepository::delete);
    }

    // Cash Withdrawal CRUD
    public CashWithdrawal createWithdrawal(CashWithdrawalRequest req) {
        UUID id = req.id();
        if (id == null) {
            id = UUID.randomUUID();
        } else {
            Optional<CashWithdrawal> existing = withdrawalRepository.findById(id);
            if (existing.isPresent()) {
                withdrawalRepository.delete(existing.get());
                withdrawalRepository.flush();
            }
        }

        CashWithdrawal w = new CashWithdrawal();
        w.setId(id);
        w.setVoucherNo(req.voucherNo().trim());
        w.setBusinessDate(req.date());
        w.setCreatedBy(req.createdBy());
        w.setBankAccount(req.bankAccount());
        w.setCurrentBalance(req.currentBalance());
        w.setAmount(req.amount());
        w.setRefNo(req.refNo());
        w.setNarration(req.narration());
        w.setQuickBank(req.quickBank());

        try {
            w.setDenominationsJson(objectMapper.writeValueAsString(req.denominations()));
        } catch (Exception e) {
            w.setDenominationsJson("{}");
        }

        return withdrawalRepository.save(w);
    }

    public List<CashWithdrawal> getAllWithdrawals() {
        return withdrawalRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<CashWithdrawal> getWithdrawalByVoucherNo(String voucherNo) {
        return withdrawalRepository.findByVoucherNo(voucherNo.trim());
    }

    public void deleteWithdrawalByVoucherNo(String voucherNo) {
        withdrawalRepository.findByVoucherNo(voucherNo.trim()).ifPresent(withdrawalRepository::delete);
    }
}
