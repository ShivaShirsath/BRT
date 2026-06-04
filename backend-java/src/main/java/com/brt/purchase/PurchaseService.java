package com.brt.purchase;

import com.brt.product.Product;
import com.brt.product.ProductRepository;
import com.brt.security.JwtPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PurchaseService {
  private final PurchaseBillRepository purchases;
  private final ProductRepository productRepository;

  public PurchaseService(PurchaseBillRepository purchases, ProductRepository productRepository) {
    this.purchases = purchases;
    this.productRepository = productRepository;
  }

  public PurchaseBill create(JwtPrincipal principal, PurchaseRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    java.util.UUID billId = req.id();
    if (billId == null) {
      billId = java.util.UUID.randomUUID();
    } else {
      java.util.Optional<PurchaseBill> existing = purchases.findById(billId);
      if (existing.isPresent()) {
        purchases.delete(existing.get());
        purchases.flush();
      }
    }

    PurchaseBill p = new PurchaseBill();
    p.setId(billId);
    p.setBillNo(req.voucherNo().trim());
    p.setNote(req.note());
    p.setCreatedAt(LocalDateTime.now());

    PurchaseBillDetail detail = new PurchaseBillDetail();
    detail.setPurchaseBill(p);
    detail.setBillDate(req.businessDate());
    detail.setEntryType(req.entryType());
    detail.setCessCondition(req.cessCondition());
    detail.setSellerId(req.sellerId());
    detail.setVehicleNo(req.vehicleNo());
    detail.setPartyBillNo(req.partyBillNo());
    detail.setCreatedAt(LocalDateTime.now());
    p.setDetail(detail);

    if (req.items() != null) {
      for (int i = 0; i < req.items().size(); i++) {
        PurchaseRequest.ItemRow itemReq = req.items().get(i);
        String commodityName = itemReq.commodity();
        if (commodityName == null || commodityName.trim().isEmpty()) {
          continue;
        }

        String commCode = commodityName.trim().toUpperCase().replace(" ", "_");
        Product product = productRepository.findByCodeIgnoreCase(commCode)
            .orElseGet(() -> productRepository.findByCodeIgnoreCase(commodityName.trim())
            .orElseGet(() -> productRepository.findByEnglishNameIgnoreCase(commodityName.trim())
            .orElseGet(() -> productRepository.findByMarathiNameIgnoreCase(commodityName.trim())
            .orElseGet(() -> {
                Product newProduct = new Product();
                newProduct.setCode(commCode);
                newProduct.setEnglishName(commodityName.trim().toUpperCase());
                newProduct.setMarathiName(commodityName.trim());
                newProduct.setBhartiWeight(0.0);
                newProduct.setDescription("Auto-created from purchase entry");
                return productRepository.save(newProduct);
            }))));

        PurchaseBillItem item = new PurchaseBillItem();
        item.setPurchaseBill(p);
        item.setItemNo(i + 1);
        item.setProduct(product);
        item.setMark(itemReq.mark());
        item.setBrand(itemReq.brand());
        item.setBags(itemReq.bags());
        item.setAvgWeight(itemReq.avgWeight() != null ? itemReq.avgWeight() : BigDecimal.ZERO);
        item.setPurchaseWeight(itemReq.purchaseWeight() != null ? itemReq.purchaseWeight() : BigDecimal.ZERO);
        item.setPackingWeight(itemReq.packingWeight() != null ? itemReq.packingWeight() : BigDecimal.ZERO);
        item.setNetWeight(itemReq.netWeight() != null ? itemReq.netWeight() : BigDecimal.ZERO);
        item.setRate(itemReq.rate() != null ? itemReq.rate() : BigDecimal.ZERO);
        item.setAmount(itemReq.amount() != null ? itemReq.amount() : BigDecimal.ZERO);
        p.getItems().add(item);
      }
    }

    if (req.charges() != null) {
      PurchaseBillChargesTaxes charges = new PurchaseBillChargesTaxes();
      charges.setPurchaseBill(p);
      PurchaseRequest.ChargesRequest chgReq = req.charges();
      charges.setPurchaseAmount(chgReq.purchaseAmount() != null ? chgReq.purchaseAmount() : BigDecimal.ZERO);
      charges.setMTax(chgReq.mTax() != null ? chgReq.mTax() : BigDecimal.ZERO);
      charges.setCommission(chgReq.commission() != null ? chgReq.commission() : BigDecimal.ZERO);
      charges.setPurchaseCommission(chgReq.purchaseCommission() != null ? chgReq.purchaseCommission() : BigDecimal.ZERO);
      charges.setFreight(chgReq.freight() != null ? chgReq.freight() : BigDecimal.ZERO);
      charges.setPacking(chgReq.packing() != null ? chgReq.packing() : BigDecimal.ZERO);
      charges.setLoading(chgReq.loading() != null ? chgReq.loading() : BigDecimal.ZERO);
      charges.setLevy(chgReq.levy() != null ? chgReq.levy() : BigDecimal.ZERO);
      charges.setTolai(chgReq.tolai() != null ? chgReq.tolai() : BigDecimal.ZERO);
      charges.setHamali(chgReq.hamali() != null ? chgReq.hamali() : BigDecimal.ZERO);
      charges.setDiscount(chgReq.discount() != null ? chgReq.discount() : BigDecimal.ZERO);
      charges.setIgst(chgReq.igst() != null ? chgReq.igst() : BigDecimal.ZERO);
      charges.setSgst(chgReq.sgst() != null ? chgReq.sgst() : BigDecimal.ZERO);
      charges.setCgst(chgReq.cgst() != null ? chgReq.cgst() : BigDecimal.ZERO);
      charges.setTds(chgReq.tds() != null ? chgReq.tds() : BigDecimal.ZERO);
      charges.setKhandani(chgReq.khandani() != null ? chgReq.khandani() : BigDecimal.ZERO);
      charges.setOurExpenses(chgReq.ourExpenses() != null ? chgReq.ourExpenses() : BigDecimal.ZERO);
      charges.setExp2(chgReq.exp2() != null ? chgReq.exp2() : BigDecimal.ZERO);
      charges.setExp3(chgReq.exp3() != null ? chgReq.exp3() : BigDecimal.ZERO);
      charges.setExp4(chgReq.exp4() != null ? chgReq.exp4() : BigDecimal.ZERO);
      charges.setTotal(chgReq.total() != null ? chgReq.total() : BigDecimal.ZERO);
      charges.setNetTotal(chgReq.netTotal() != null ? chgReq.netTotal() : BigDecimal.ZERO);
      charges.setCreatedAt(LocalDateTime.now());
      p.setCharges(charges);
    } else {
      PurchaseBillChargesTaxes charges = new PurchaseBillChargesTaxes();
      charges.setPurchaseBill(p);
      charges.setPurchaseAmount(BigDecimal.ZERO);
      charges.setTotal(BigDecimal.ZERO);
      charges.setNetTotal(BigDecimal.ZERO);
      charges.setCreatedAt(LocalDateTime.now());
      p.setCharges(charges);
    }

    return purchases.save(p);
  }

  public List<PurchaseBill> recent(String firmId) {
    return purchases.findTop20ByOrderByCreatedAtDesc();
  }

  public java.util.Map<String, Object> getBillDetailsByNo(String billNo) {
    return purchases.findByBillNo(billNo.trim())
      .map(p -> {
        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("id", p.getId());
        res.put("billNo", p.getBillNo());
        res.put("note", p.getNote());
        
        if (p.getDetail() != null) {
          PurchaseBillDetail d = p.getDetail();
          res.put("billDate", d.getBillDate());
          res.put("entryType", d.getEntryType());
          res.put("cessCondition", d.getCessCondition());
          res.put("sellerId", d.getSellerId());
          res.put("vehicleNo", d.getVehicleNo());
          res.put("partyBillNo", d.getPartyBillNo());
        }
        
        java.util.List<java.util.Map<String, Object>> itemsList = new java.util.ArrayList<>();
        if (p.getItems() != null) {
          for (PurchaseBillItem item : p.getItems()) {
            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
            itemMap.put("itemNo", item.getItemNo());
            itemMap.put("commodity", item.getProduct() != null ? item.getProduct().getEnglishName() : "");
            itemMap.put("mark", item.getMark());
            itemMap.put("brand", item.getBrand());
            itemMap.put("bags", item.getBags());
            itemMap.put("avgWeight", item.getAvgWeight());
            itemMap.put("purchaseWeight", item.getPurchaseWeight());
            itemMap.put("packingWeight", item.getPackingWeight());
            itemMap.put("netWeight", item.getNetWeight());
            itemMap.put("rate", item.getRate());
            itemMap.put("amount", item.getAmount());
            itemsList.add(itemMap);
          }
        }
        res.put("items", itemsList);
        
        if (p.getCharges() != null) {
          PurchaseBillChargesTaxes c = p.getCharges();
          java.util.Map<String, Object> chg = new java.util.HashMap<>();
          chg.put("purchaseAmount", c.getPurchaseAmount());
          chg.put("mTax", c.getMTax());
          chg.put("commission", c.getCommission());
          chg.put("purchaseCommission", c.getPurchaseCommission());
          chg.put("freight", c.getFreight());
          chg.put("packing", c.getPacking());
          chg.put("loading", c.getLoading());
          chg.put("levy", c.getLevy());
          chg.put("tolai", c.getTolai());
          chg.put("hamali", c.getHamali());
          chg.put("discount", c.getDiscount());
          chg.put("igst", c.getIgst());
          chg.put("sgst", c.getSgst());
          chg.put("cgst", c.getCgst());
          chg.put("tds", c.getTds());
          chg.put("khandani", c.getKhandani());
          chg.put("ourExpenses", c.getOurExpenses());
          chg.put("exp2", c.getExp2());
          chg.put("exp3", c.getExp3());
          chg.put("exp4", c.getExp4());
          chg.put("total", c.getTotal());
          chg.put("netTotal", c.getNetTotal());
          res.put("charges", chg);
        }
        
        return res;
      })
      .orElse(null);
  }

  public java.util.List<java.util.Map<String, Object>> createBulk(JwtPrincipal principal, java.util.List<PurchaseRequest> requests) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    
    java.util.List<java.util.Map<String, Object>> results = new java.util.ArrayList<>();
    for (PurchaseRequest req : requests) {
      try {
        PurchaseBill p = create(principal, req);
        results.add(java.util.Map.of(
          "id", p.getId(),
          "billNo", p.getBillNo(),
          "status", "SUCCESS",
          "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : java.math.BigDecimal.ZERO
        ));
      } catch (Exception e) {
        results.add(java.util.Map.of(
          "billNo", req.voucherNo(),
          "status", "ERROR",
          "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
        ));
      }
    }
    return results;
  }
}
