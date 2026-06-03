package com.brt.sales;

import com.brt.security.JwtPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SalesService {
  private final SalePattiRepository salePattiRepository;

  public SalesService(SalePattiRepository salePattiRepository) {
    this.salePattiRepository = salePattiRepository;
  }

  public SalePatti create(JwtPrincipal principal, SalesRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    java.util.UUID pattiId = req.id();
    if (pattiId == null) {
      pattiId = java.util.UUID.randomUUID();
    } else {
      java.util.Optional<SalePatti> existing = salePattiRepository.findById(pattiId);
      if (existing.isPresent()) {
        salePattiRepository.delete(existing.get());
        salePattiRepository.flush();
      }
    }

    SalePatti patti = new SalePatti();
    patti.setId(pattiId);
    patti.setSalePattiNo(req.voucherNo().trim());
    patti.setRemark(req.remark());
    patti.setSalesCompleted(req.salesCompleted() != null ? req.salesCompleted() : false);
    patti.setCreatedAt(LocalDateTime.now());
    patti.setUpdatedAt(LocalDateTime.now());

    SalePattiDetail detail = new SalePattiDetail();
    detail.setSalePatti(patti);
    detail.setPattiDate(req.businessDate());
    detail.setDeliveryAddress(req.deliveredTo());
    detail.setVehicleNo(req.vehicleNo());
    detail.setPartyBillNo(req.partyBillNo());
    detail.setCreatedAt(LocalDateTime.now());
    patti.setDetail(detail);

    if (req.items() != null) {
      for (int i = 0; i < req.items().size(); i++) {
        SalesRequest.ItemRow itemReq = req.items().get(i);
        String pattiNo = itemReq.pattiNo();
        if (pattiNo == null || pattiNo.trim().isEmpty()) {
          continue;
        }

        SalePattiItem item = new SalePattiItem();
        item.setSalePatti(patti);
        item.setItemNo(i + 1);

        if (itemReq.bookDate() != null && !itemReq.bookDate().trim().isEmpty()) {
          try {
            item.setBookDate(LocalDate.parse(itemReq.bookDate().trim()));
          } catch (Exception e) {}
        }
        item.setPattiNo(pattiNo.trim());
        if (itemReq.pattiDate() != null && !itemReq.pattiDate().trim().isEmpty()) {
          try {
            item.setPattiItemDate(LocalDate.parse(itemReq.pattiDate().trim()));
          } catch (Exception e) {}
        }

        item.setBags(itemReq.bags() != null ? itemReq.bags() : 0);
        item.setPattiWeight(itemReq.pattiWt() != null ? itemReq.pattiWt() : BigDecimal.ZERO);
        item.setPattiFreight(itemReq.pattiFreight() != null ? itemReq.pattiFreight() : BigDecimal.ZERO);
        item.setCommission(itemReq.commission() != null ? itemReq.commission() : BigDecimal.ZERO);
        item.setTdsPercentage(itemReq.tdsPercent() != null ? itemReq.tdsPercent() : BigDecimal.ZERO);
        item.setTdsAmount(itemReq.tdsAmount() != null ? itemReq.tdsAmount() : BigDecimal.ZERO);
        item.setPattiNet(itemReq.pattiNet() != null ? itemReq.pattiNet() : BigDecimal.ZERO);
        item.setCreatedAt(LocalDateTime.now());
        patti.getItems().add(item);
      }
    }

    BigDecimal totalNet = patti.getItems().stream()
      .map(SalePattiItem::getPattiNet)
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    SalePattiTotal totals = new SalePattiTotal();
    totals.setSalePatti(patti);
    totals.setAsPerChallan(totalNet);
    totals.setPattiNetTotal(totalNet);
    totals.setCreatedAt(LocalDateTime.now());
    patti.setTotals(totals);

    return salePattiRepository.save(patti);
  }

  public List<SalePatti> recent() {
    return salePattiRepository.findTop20ByOrderByCreatedAtDesc();
  }

  public java.util.Map<String, Object> getSalePattiDetailsByNo(String pattiNo) {
    return salePattiRepository.findBySalePattiNo(pattiNo.trim())
      .map(p -> {
        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("id", p.getId());
        res.put("voucherNo", p.getSalePattiNo());
        res.put("remark", p.getRemark());
        res.put("salesComplete", p.getSalesCompleted() != null && p.getSalesCompleted() ? "Yes" : "No");

        if (p.getDetail() != null) {
          SalePattiDetail d = p.getDetail();
          res.put("businessDate", d.getPattiDate());
          res.put("deliveredTo", d.getDeliveryAddress());
          res.put("vehicleNo", d.getVehicleNo());
          res.put("partyBillNo", d.getPartyBillNo());
        }

        java.util.List<java.util.Map<String, Object>> itemsList = new java.util.ArrayList<>();
        if (p.getItems() != null) {
          for (SalePattiItem item : p.getItems()) {
            java.util.Map<String, Object> itemMap = new java.util.HashMap<>();
            itemMap.put("bookDate", item.getBookDate() != null ? item.getBookDate().toString() : "");
            itemMap.put("pattiNo", item.getPattiNo());
            itemMap.put("pattiDate", item.getPattiItemDate() != null ? item.getPattiItemDate().toString() : "");
            itemMap.put("bags", String.valueOf(item.getBags()));
            itemMap.put("pattiWt", item.getPattiWeight() != null ? item.getPattiWeight().toString() : "0.00");
            itemMap.put("pattiFreight", item.getPattiFreight() != null ? item.getPattiFreight().toString() : "0.00");
            itemMap.put("commission", item.getCommission() != null ? item.getCommission().toString() : "0.00");
            itemMap.put("tdsPercent", item.getTdsPercentage() != null ? item.getTdsPercentage().toString() : "0.00");
            itemsList.add(itemMap);
          }
        }
        res.put("items", itemsList);
        return res;
      })
      .orElse(null);
  }

  public java.util.List<java.util.Map<String, Object>> createBulk(JwtPrincipal principal, java.util.List<SalesRequest> requests) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    java.util.List<java.util.Map<String, Object>> results = new java.util.ArrayList<>();
    for (SalesRequest req : requests) {
      try {
        SalePatti patti = create(principal, req);
        results.add(java.util.Map.of(
          "id", patti.getId(),
          "salePattiNo", patti.getSalePattiNo(),
          "status", "SUCCESS",
          "amount", patti.getTotals() != null ? patti.getTotals().getPattiNetTotal() : java.math.BigDecimal.ZERO
        ));
      } catch (Exception e) {
        results.add(java.util.Map.of(
          "salePattiNo", req.voucherNo(),
          "status", "ERROR",
          "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
        ));
      }
    }
    return results;
  }
}