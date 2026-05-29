package com.brt.purchase;

import com.brt.security.JwtPrincipal;
import com.brt.product.Product;
import com.brt.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class PurchaseService {
  private final PurchaseBillRepository purchases;
  private final ProductRepository productRepository;

  public PurchaseService(PurchaseBillRepository purchases, ProductRepository productRepository) {
    this.purchases = purchases;
    this.productRepository = productRepository;
  }

  public PurchaseBill createOrUpdate(JwtPrincipal principal, PurchaseRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    // Check if bill exists by ID or by billNo
    PurchaseBill p = null;
    if (req.id() != null) {
      p = purchases.findById(req.id()).orElse(null);
    }
    if (p == null) {
      p = purchases.findByBillNo(req.voucherNo().trim()).orElse(null);
    }

    boolean isNew = (p == null);
    if (isNew) {
      p = new PurchaseBill();
      p.setBillNo(req.voucherNo().trim());
      p.setCreatedAt(LocalDateTime.now());
    }
    p.setUpdatedAt(LocalDateTime.now());
    p.setNote(req.note());

    // Update Detail
    PurchaseBillDetail detail = p.getDetail();
    if (detail == null) {
      detail = new PurchaseBillDetail();
      detail.setPurchaseBill(p);
      detail.setCreatedAt(LocalDateTime.now());
      p.setDetail(detail);
    }
    detail.setBillDate(req.businessDate());
    detail.setEntryType(req.entryType());
    detail.setCessCondition(req.cessCondition());
    detail.setVehicleNo(req.vehicleNo());
    detail.setPartyBillNo(req.partyBillNo());
    detail.setSellerId(parseLong(req.supplierAcno()));

    // Update items
    p.getItems().clear();
    int index = 1;
    for (PurchaseItemRequest itemReq : req.items()) {
      if (itemReq.commodity() == null || itemReq.commodity().trim().isEmpty()) {
        continue;
      }
      PurchaseBillItem item = new PurchaseBillItem();
      item.setPurchaseBill(p);
      item.setItemNo(index++);

      String prodCode = itemReq.commodity().trim();
      Product product = productRepository.findByCode(prodCode)
          .orElseGet(() -> {
            Product newProd = new Product();
            newProd.setCode(prodCode);
            newProd.setEnglishName(prodCode.toUpperCase());
            newProd.setBhartiWeight(0.0);
            return productRepository.save(newProd);
          });
      item.setProduct(product);
      item.setMarkId(parseLong(itemReq.mark()));
      item.setBrandId(parseLong(itemReq.brand()));
      item.setBags(itemReq.bags() != null ? itemReq.bags() : 0);
      item.setAvgWeight(itemReq.avgWt() != null ? itemReq.avgWt() : BigDecimal.ZERO);
      item.setPurchaseWeight(itemReq.purWt() != null ? itemReq.purWt() : BigDecimal.ZERO);
      item.setPackingWeight(itemReq.packingWeight() != null ? itemReq.packingWeight() : BigDecimal.ZERO);
      item.setNetWeight(itemReq.netWt() != null ? itemReq.netWt() : BigDecimal.ZERO);
      item.setRate(itemReq.rate() != null ? itemReq.rate() : BigDecimal.ZERO);
      item.setAmount(item.getNetWeight().multiply(item.getRate()));
      p.getItems().add(item);
    }

    // Update charges
    PurchaseBillChargesTaxes charges = p.getCharges();
    if (charges == null) {
      charges = new PurchaseBillChargesTaxes();
      charges.setPurchaseBill(p);
      charges.setCreatedAt(LocalDateTime.now());
      p.setCharges(charges);
    }
    mapCharges(charges, req.charges());

    return purchases.save(p);
  }

  public Optional<PurchaseBill> findByBillNo(String billNo) {
    return purchases.findByBillNo(billNo);
  }

  public List<PurchaseBill> recent(String firmId) {
    return purchases.findTop20ByOrderByIdDesc();
  }

  private void mapCharges(PurchaseBillChargesTaxes entity, Map<String, String> map) {
    if (map == null) return;
    entity.setPurchaseAmount(parseDecimal(map.get("Purchase amt.")));
    entity.setMTax(parseDecimal(map.get("M. Tax")));
    entity.setCommission(parseDecimal(map.get("Commission")));
    entity.setPurchaseCommission(parseDecimal(map.get("Pur. Comm")));
    entity.setFreight(parseDecimal(map.get("Freight")));
    entity.setPacking(parseDecimal(map.get("Packing")));
    entity.setLoading(parseDecimal(map.get("Loading")));
    entity.setLevy(parseDecimal(map.containsKey("Leivy") ? map.get("Leivy") : map.get("Levy")));
    entity.setTolai(parseDecimal(map.get("Tolai")));
    entity.setHamali(parseDecimal(map.get("Hamali")));
    entity.setDiscount(parseDecimal(map.get("Discount")));
    entity.setIgst(parseDecimal(map.get("IGST")));
    entity.setSgst(parseDecimal(map.get("SGST")));
    entity.setCgst(parseDecimal(map.get("CGST")));
    entity.setTds(parseDecimal(map.get("TDS")));
    entity.setKhandani(parseDecimal(map.get("Khandani")));
    entity.setOurExpenses(parseDecimal(map.get("Our expenses")));
    entity.setExp2(parseDecimal(map.get("Exp. 2")));
    entity.setExp3(parseDecimal(map.get("Exp. 3")));
    entity.setExp4(parseDecimal(map.get("Exp. 4")));

    // Calculate total and netTotal
    BigDecimal total = entity.getPurchaseAmount()
        .add(entity.getMTax())
        .add(entity.getCommission())
        .add(entity.getPurchaseCommission())
        .add(entity.getFreight())
        .add(entity.getPacking())
        .add(entity.getLoading())
        .add(entity.getLevy())
        .add(entity.getTolai())
        .add(entity.getHamali())
        .add(entity.getKhandani())
        .add(entity.getOurExpenses())
        .add(entity.getExp2())
        .add(entity.getExp3())
        .add(entity.getExp4())
        .subtract(entity.getDiscount());
    entity.setTotal(total);

    BigDecimal netTotal = total
        .add(entity.getIgst())
        .add(entity.getSgst())
        .add(entity.getCgst())
        .subtract(entity.getTds());
    entity.setNetTotal(netTotal);
  }

  private BigDecimal parseDecimal(String val) {
    if (val == null || val.trim().isEmpty()) return BigDecimal.ZERO;
    try {
      return new BigDecimal(val.trim());
    } catch (NumberFormatException e) {
      return BigDecimal.ZERO;
    }
  }

  private Long parseLong(String val) {
    if (val == null || val.trim().isEmpty()) return null;
    try {
      return Long.parseLong(val.trim());
    } catch (NumberFormatException e) {
      return null;
    }
  }
}
