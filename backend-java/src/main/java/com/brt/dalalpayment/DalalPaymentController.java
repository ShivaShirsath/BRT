package com.brt.dalalpayment;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dalal-payment")
public class DalalPaymentController {
    private final DalalPaymentService service;

    public DalalPaymentController(DalalPaymentService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody DalalPaymentRequest req) {
        DalalPaymentVoucher v = service.createOrUpdate(req);
        return Map.of("id", v.getId(), "billNo", v.getBillNo());
    }

    @GetMapping
    public List<DalalPaymentVoucher> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-bill-no/{billNo}")
    public DalalPaymentVoucher getByBillNo(@PathVariable String billNo) {
        return service.getByBillNo(billNo).orElse(null);
    }

    @DeleteMapping("/by-bill-no/{billNo}")
    public Map<String, Object> delete(@PathVariable String billNo) {
        service.deleteByBillNo(billNo);
        return Map.of("status", "SUCCESS");
    }
}
