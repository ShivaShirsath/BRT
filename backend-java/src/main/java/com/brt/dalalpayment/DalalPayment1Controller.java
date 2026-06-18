package com.brt.dalalpayment;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dalal-payment-1")
public class DalalPayment1Controller {
    private final DalalPayment1Service service;

    public DalalPayment1Controller(DalalPayment1Service service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody DalalPayment1Request req) {
        DalalPayment1Voucher v = service.createOrUpdate(req);
        return Map.of("id", v.getId(), "voucherNo", v.getVoucherNo());
    }

    @GetMapping
    public List<DalalPayment1Voucher> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-voucher-no/{voucherNo}")
    public DalalPayment1Voucher getByVoucherNo(@PathVariable String voucherNo) {
        return service.getByVoucherNo(voucherNo).orElse(null);
    }

    @DeleteMapping("/by-voucher-no/{voucherNo}")
    public Map<String, Object> delete(@PathVariable String voucherNo) {
        service.deleteByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }
}
