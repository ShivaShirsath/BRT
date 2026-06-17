package com.brt.cash;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
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

    public BigDecimal getBankAccountBalance(String bankAccount, UUID excludeWithdrawalId) {
        if (bankAccount == null || bankAccount.trim().isEmpty() || "Select bank account...".equalsIgnoreCase(bankAccount) || "Select bank...".equalsIgnoreCase(bankAccount)) {
            return BigDecimal.ZERO;
        }
        BigDecimal deposits = depositRepository.sumAmountByBankAccount(bankAccount.trim());
        BigDecimal withdrawals = excludeWithdrawalId != null
            ? withdrawalRepository.sumAmountByBankAccountExcludingId(bankAccount.trim(), excludeWithdrawalId)
            : withdrawalRepository.sumAmountByBankAccount(bankAccount.trim());
        return deposits.subtract(withdrawals);
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
        d.setBusinessDate(req.businessDate());
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

        BigDecimal availableBalance = getBankAccountBalance(req.bankAccount(), id);
        if (req.amount().compareTo(availableBalance) > 0) {
            throw new IllegalArgumentException("Withdrawal amount of " + req.amount() + " exceeds the available balance of " + availableBalance);
        }

        // Validate denominations total does not exceed the amount
        if (req.denominations() != null) {
            BigDecimal denomTotal = BigDecimal.ZERO;
            for (java.util.Map.Entry<String, Integer> entry : req.denominations().entrySet()) {
                try {
                    BigDecimal denomVal = new BigDecimal(entry.getKey());
                    BigDecimal count = new BigDecimal(entry.getValue());
                    denomTotal = denomTotal.add(denomVal.multiply(count));
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
            if (denomTotal.compareTo(req.amount()) > 0) {
                throw new IllegalArgumentException("Denominations total (" + denomTotal + ") cannot exceed withdrawal amount (" + req.amount() + ")");
            }
        }

        CashWithdrawal w = new CashWithdrawal();
        w.setId(id);
        w.setVoucherNo(req.voucherNo().trim());
        w.setBusinessDate(req.businessDate());
        w.setCreatedBy(req.createdBy());
        w.setBankAccount(req.bankAccount());
        w.setCurrentBalance(availableBalance.subtract(req.amount()));
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
