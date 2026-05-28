package com.brt.purchase;

import com.brt.security.JwtPrincipal;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PurchaseService {
  private final PurchaseBillRepository purchases;

  public PurchaseService(PurchaseBillRepository purchases) {
    this.purchases = purchases;
  }

  public PurchaseBill create(JwtPrincipal principal, PurchaseRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    PurchaseBill p = new PurchaseBill();
    p.setBillNo(req.voucherNo().trim());
    p.setCreatedAt(LocalDateTime.now());

    PurchaseBillDetail detail = new PurchaseBillDetail();
    detail.setPurchaseBill(p);
    detail.setBillDate(req.businessDate());
    detail.setCreatedAt(LocalDateTime.now());
    p.setDetail(detail);

    PurchaseBillItem item = new PurchaseBillItem();
    item.setPurchaseBill(p);
    item.setItemNo(1);
    item.setNetWeight(req.qty());
    item.setRate(req.rate());
    BigDecimal amount = req.qty().multiply(req.rate());
    item.setAmount(amount);
    p.getItems().add(item);

    PurchaseBillChargesTaxes charges = new PurchaseBillChargesTaxes();
    charges.setPurchaseBill(p);
    charges.setPurchaseAmount(amount);
    charges.setTotal(amount);
    charges.setNetTotal(amount);
    charges.setCreatedAt(LocalDateTime.now());
    p.setCharges(charges);

    return purchases.save(p);
  }

  public List<PurchaseBill> recent(String firmId) {
    // purchase_bills table doesn't contain firmId in the DDL provided. Return recent bills globally.
    return purchases.findTop20ByOrderByIdDesc();
  }
}
