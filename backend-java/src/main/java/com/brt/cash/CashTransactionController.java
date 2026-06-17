package com.brt.cash;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class CashTransactionController {
    private final CashTransactionService service;

    public CashTransactionController(CashTransactionService service) {
        this.service = service;
    }

    // Cash Deposit endpoints
    @PostMapping("/cash-deposit")
    public Map<String, Object> createDeposit(@RequestBody CashDepositRequest req) {
        CashDeposit d = service.createDeposit(req);
        return Map.of("id", d.getId(), "voucherNo", d.getVoucherNo());
    }

    @PutMapping("/cash-deposit/{id}")
    public Map<String, Object> updateDeposit(@PathVariable java.util.UUID id, @RequestBody CashDepositRequest req) {
        CashDepositRequest updatedReq = new CashDepositRequest(
            id,
            req.voucherNo(),
            req.businessDate(),
            req.createdBy(),
            req.bankAccount(),
            req.amount(),
            req.narration(),
            req.denominations()
        );
        CashDeposit d = service.createDeposit(updatedReq);
        return Map.of("id", d.getId(), "voucherNo", d.getVoucherNo());
    }

    @GetMapping("/cash-deposit")
    public List<CashDeposit> getAllDeposits() {
        return service.getAllDeposits();
    }

    @GetMapping("/cash-deposit/by-voucher-no/{voucherNo}")
    public CashDeposit getDepositByVoucherNo(@PathVariable String voucherNo) {
        return service.getDepositByVoucherNo(voucherNo).orElse(null);
    }

    @DeleteMapping("/cash-deposit/by-voucher-no/{voucherNo}")
    public Map<String, Object> deleteDeposit(@PathVariable String voucherNo) {
        service.deleteDepositByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }

    // Cash Withdrawal endpoints
    @PostMapping("/cash-withdrawal")
    public Map<String, Object> createWithdrawal(@RequestBody CashWithdrawalRequest req) {
        CashWithdrawal w = service.createWithdrawal(req);
        return Map.of("id", w.getId(), "voucherNo", w.getVoucherNo());
    }

    @PutMapping("/cash-withdrawal/{id}")
    public Map<String, Object> updateWithdrawal(@PathVariable java.util.UUID id, @RequestBody CashWithdrawalRequest req) {
        CashWithdrawalRequest updatedReq = new CashWithdrawalRequest(
            id,
            req.voucherNo(),
            req.businessDate(),
            req.createdBy(),
            req.bankAccount(),
            req.currentBalance(),
            req.amount(),
            req.refNo(),
            req.narration(),
            req.denominations(),
            req.quickBank()
        );
        CashWithdrawal w = service.createWithdrawal(updatedReq);
        return Map.of("id", w.getId(), "voucherNo", w.getVoucherNo());
    }

    @GetMapping("/cash-withdrawal")
    public List<CashWithdrawal> getAllWithdrawals() {
        return service.getAllWithdrawals();
    }

    @GetMapping("/cash-withdrawal/by-voucher-no/{voucherNo}")
    public CashWithdrawal getWithdrawalByVoucherNo(@PathVariable String voucherNo) {
        return service.getWithdrawalByVoucherNo(voucherNo).orElse(null);
    }

    @GetMapping("/bank-accounts/balance")
    public Map<String, Object> getBankAccountBalance(@RequestParam String bankAccount, @RequestParam(required = false) java.util.UUID excludeWithdrawalId) {
        java.math.BigDecimal balance = service.getBankAccountBalance(bankAccount, excludeWithdrawalId);
        return Map.of("bankAccount", bankAccount, "balance", balance);
    }

    @DeleteMapping("/cash-withdrawal/by-voucher-no/{voucherNo}")
    public Map<String, Object> deleteWithdrawal(@PathVariable String voucherNo) {
        service.deleteWithdrawalByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }
}
