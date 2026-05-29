package com.brt.purchase;

import com.brt.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase")
public class PurchaseController {
  private final PurchaseService purchaseService;

  public PurchaseController(PurchaseService purchaseService) {
    this.purchaseService = purchaseService;
  }

  @PostMapping
  public Map<String, Object> save(@AuthenticationPrincipal JwtPrincipal principal, @RequestBody PurchaseRequest req) {
    PurchaseBill p = purchaseService.createOrUpdate(principal, req);
    return Map.of("id", p.getId(), "billNo", p.getBillNo(), "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : null);
  }

  @GetMapping("/{billNo}")
  public Map<String, Object> getByBillNo(@AuthenticationPrincipal JwtPrincipal principal, @PathVariable String billNo) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    PurchaseBill p = purchaseService.findByBillNo(billNo.trim())
      .orElseThrow(() -> new IllegalArgumentException("Purchase bill not found: " + billNo));
    return mapBillToResponse(p);
  }

  @GetMapping
  public Map<String, Object> recent(@AuthenticationPrincipal JwtPrincipal principal) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");
    return Map.of("rows", purchaseService.recent(principal.firmCode()).stream().map(p -> Map.of(
      "id", p.getId(), "billNo", p.getBillNo(), "amount", p.getCharges() != null ? p.getCharges().getNetTotal() : null
    )).toList());
  }

  private Map<String, Object> mapBillToResponse(PurchaseBill p) {
    PurchaseBillDetail d = p.getDetail();
    PurchaseBillChargesTaxes c = p.getCharges();
    
    String formattedDate = "";
    if (d != null && d.getBillDate() != null) {
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy");
        formattedDate = d.getBillDate().format(dtf);
    }

    List<Map<String, Object>> itemsList = p.getItems().stream().map(item -> {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("commodity", item.getProduct() != null ? item.getProduct().getCode() : "");
        m.put("mark", item.getMarkId() != null ? item.getMarkId().toString() : "");
        m.put("brand", item.getBrandId() != null ? item.getBrandId().toString() : "");
        m.put("bags", item.getBags() != null ? item.getBags().toString() : "0");
        m.put("avgWt", item.getAvgWeight() != null ? item.getAvgWeight().toString() : "0.00");
        m.put("purWt", item.getPurchaseWeight() != null ? item.getPurchaseWeight().toString() : "0.00");
        m.put("packingWeight", item.getPackingWeight() != null ? item.getPackingWeight().toString() : "0.00");
        m.put("netWt", item.getNetWeight() != null ? item.getNetWeight().toString() : "0.00");
        m.put("rate", item.getRate() != null ? item.getRate().toString() : "0.00");
        return m;
      }).toList();

    Map<String, String> chargesMap = new java.util.HashMap<>();
    if (c != null) {
        chargesMap.put("Purchase amt.", c.getPurchaseAmount().toString());
        chargesMap.put("M. Tax", c.getMTax().toString());
        chargesMap.put("Commission", c.getCommission().toString());
        chargesMap.put("Pur. Comm", c.getPurchaseCommission().toString());
        chargesMap.put("Freight", c.getFreight().toString());
        chargesMap.put("Packing", c.getPacking().toString());
        chargesMap.put("Loading", c.getLoading().toString());
        chargesMap.put("Leivy", c.getLevy().toString());
        chargesMap.put("Tolai", c.getTolai().toString());
        chargesMap.put("Hamali", c.getHamali().toString());
        chargesMap.put("Discount", c.getDiscount().toString());
        chargesMap.put("IGST", c.getIgst().toString());
        chargesMap.put("SGST", c.getSgst().toString());
        chargesMap.put("CGST", c.getCgst().toString());
        chargesMap.put("TDS", c.getTds().toString());
        chargesMap.put("Khandani", c.getKhandani().toString());
        chargesMap.put("Our expenses", c.getOurExpenses().toString());
        chargesMap.put("Exp. 2", c.getExp2().toString());
        chargesMap.put("Exp. 3", c.getExp3().toString());
        chargesMap.put("Exp. 4", c.getExp4().toString());
    } else {
        String[] fields = {
          "Purchase amt.", "M. Tax", "Commission", "Pur. Comm", "Freight", "Packing", "Loading", "Leivy",
          "Tolai", "Hamali", "Discount", "IGST", "SGST", "CGST", "TDS", "Khandani",
          "Our expenses", "Exp. 2", "Exp. 3", "Exp. 4"
        };
        for (String f : fields) {
            chargesMap.put(f, "0.00");
        }
    }

    Map<String, Object> resp = new java.util.HashMap<>();
    resp.put("id", p.getId());
    resp.put("billNo", p.getBillNo());
    resp.put("date", formattedDate);
    resp.put("entryType", d != null ? d.getEntryType() : "");
    resp.put("cessCondition", d != null ? d.getCessCondition() : "");
    resp.put("seller", d != null && d.getSellerId() != null ? d.getSellerId().toString() : "");
    resp.put("vehicleNo", d != null ? d.getVehicleNo() : "");
    resp.put("partyBillNo", d != null ? d.getPartyBillNo() : "");
    resp.put("note", p.getNote());
    resp.put("items", itemsList);
    resp.put("charges", chargesMap);
    return resp;
  }
}
