package com.brt.payment_voucher;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment-voucher")
public class PaymentVoucherController {
    private final PaymentVoucherService service;

    public PaymentVoucherController(PaymentVoucherService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody PaymentVoucherRequest req) {
        PaymentVoucher v = service.createOrUpdate(req);
        return Map.of("id", v.getId(), "voucherNo", v.getVoucherNo());
    }

    @GetMapping
    public List<PaymentVoucher> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-voucher-no/{voucherNo}")
    public PaymentVoucher getByVoucherNo(@PathVariable String voucherNo) {
        return service.getByVoucherNo(voucherNo).orElse(null);
    }

    @DeleteMapping("/by-voucher-no/{voucherNo}")
    public Map<String, Object> delete(@PathVariable String voucherNo) {
        service.deleteByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }
}
