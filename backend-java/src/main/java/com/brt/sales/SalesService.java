package com.brt.sales;

import com.brt.security.JwtPrincipal;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SalesService {
  private final SalePattiRepository salePattiRepository;

  public SalesService(SalePattiRepository salePattiRepository) {
    this.salePattiRepository = salePattiRepository;
  }

  public SalePatti create(JwtPrincipal principal, SalesRequest req) {
    if (principal == null) throw new IllegalArgumentException("Unauthorized");

    SalePatti patti = new SalePatti();
    patti.setSalePattiNo(req.voucherNo().trim());
    patti.setSalesCompleted(false);
    patti.setCreatedAt(LocalDateTime.now());
    patti.setUpdatedAt(LocalDateTime.now());

    SalePattiDetail detail = new SalePattiDetail();
    detail.setSalePatti(patti);
    detail.setPattiDate(req.businessDate());
    detail.setCreatedAt(LocalDateTime.now());
    patti.setDetail(detail);

    SalePattiItem item = new SalePattiItem();
    item.setSalePatti(patti);
    item.setItemNo(1);
    item.setPattiWeight(req.qty());
    patti.getItems().add(item);

    BigDecimal amount = req.qty().multiply(req.rate());
    SalePattiTotal totals = new SalePattiTotal();
    totals.setSalePatti(patti);
    totals.setAsPerChallan(amount);
    totals.setPattiNetTotal(amount);
    totals.setCreatedAt(LocalDateTime.now());
    patti.setTotals(totals);

    return salePattiRepository.save(patti);
  }

  public List<SalePatti> recent() {
    return salePattiRepository.findTop20ByOrderByIdDesc();
  }
}