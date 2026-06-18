package com.brt.receipt;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer-receipt")
public class CustomerReceiptController {
    private final CustomerReceiptService service;

    public CustomerReceiptController(CustomerReceiptService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody CustomerReceiptRequest req) {
        CustomerReceipt r = service.createOrUpdate(req);
        return Map.of("id", r.getId(), "voucherNo", r.getVoucherNo());
    }

    @GetMapping
    public List<CustomerReceipt> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-voucher-no/{voucherNo}")
    public CustomerReceipt getByVoucherNo(@PathVariable String voucherNo) {
        return service.getByVoucherNo(voucherNo).orElse(null);
    }

    @DeleteMapping("/by-voucher-no/{voucherNo}")
    public Map<String, Object> delete(@PathVariable String voucherNo) {
        service.deleteByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }
}
