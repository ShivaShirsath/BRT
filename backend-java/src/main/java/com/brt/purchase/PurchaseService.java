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

    PurchaseBill p = new PurchaseBill();
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
            .orElseGet(() -> productRepository.findByEnglishNameIgnoreCase(commodityName.trim())
            .orElseGet(() -> {
                Product newProduct = new Product();
                newProduct.setCode(commCode);
                newProduct.setEnglishName(commodityName.trim().toUpperCase());
                newProduct.setMarathiName(commodityName.trim());
                newProduct.setBhartiWeight(0.0);
                newProduct.setDescription("Auto-created from purchase entry");
                return productRepository.save(newProduct);
            }));

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
    return purchases.findTop20ByOrderByIdDesc();
  }
}
