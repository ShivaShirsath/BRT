package com.brt.misc_receipt;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/misc-receipt")
public class MiscReceiptController {
    private final MiscReceiptService service;

    public MiscReceiptController(MiscReceiptService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody MiscReceiptRequest req) {
        MiscReceipt r = service.createOrUpdate(req);
        return Map.of("id", r.getId(), "voucherNo", r.getVoucherNo());
    }

    @GetMapping
    public List<MiscReceipt> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-voucher-no/{voucherNo}")
    public MiscReceipt getByVoucherNo(@PathVariable String voucherNo) {
        return service.getByVoucherNo(voucherNo).orElse(null);
    }

    @DeleteMapping("/by-voucher-no/{voucherNo}")
    public Map<String, Object> delete(@PathVariable String voucherNo) {
        service.deleteByVoucherNo(voucherNo);
        return Map.of("status", "SUCCESS");
    }
}
