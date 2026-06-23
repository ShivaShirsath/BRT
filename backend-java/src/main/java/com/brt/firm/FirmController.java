package com.brt.firm;

import com.brt.auth.AppUserRepository;
import com.brt.auth.AppUser;
import com.brt.security.JwtPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/firms")
public class FirmController {
  private final FirmRepository firms;
  private final AppUserRepository appUsers;

  public FirmController(FirmRepository firms, AppUserRepository appUsers) {
    this.firms = firms;
    this.appUsers = appUsers;
  }

  @GetMapping
  public Map<String, Object> list(@AuthenticationPrincipal JwtPrincipal principal) {
    var allFirms = firms.findByActiveTrueOrderByNameAsc();
    if (principal == null) {
      return Map.of("firms", allFirms.stream().map(f -> Map.of(
        "code", f.getCode(),
        "name", f.getName()
      )).toList());
    }

    if ("ADMIN".equalsIgnoreCase(principal.roleCode())) {
      return Map.of("firms", allFirms.stream().map(f -> Map.of(
        "code", f.getCode(),
        "name", f.getName(),
        "bookStartDate", f.getBookStartDate() != null ? f.getBookStartDate().toString() : "",
        "businessType", f.getBusinessType() != null ? f.getBusinessType() : "",
        "financialYear", f.getFinancialYear() != null ? f.getFinancialYear() : "",
        "displayName", f.getDisplayName() != null ? f.getDisplayName() : "",
        "address", f.getAddress() != null ? f.getAddress() : "",
        "phone", f.getPhone() != null ? f.getPhone() : "",
        "logo", f.getLogo() != null ? f.getLogo() : ""
      )).toList());
    }

    java.util.List<String> userFirmCodes = appUsers.findByUserCodeIgnoreCase(principal.userCode())
      .stream().map(AppUser::getFirmId).toList();

    return Map.of("firms", allFirms.stream()
      .filter(f -> userFirmCodes.contains(f.getCode()))
      .map(f -> Map.of(
        "code", f.getCode(),
        "name", f.getName(),
        "bookStartDate", f.getBookStartDate() != null ? f.getBookStartDate().toString() : "",
        "businessType", f.getBusinessType() != null ? f.getBusinessType() : "",
        "financialYear", f.getFinancialYear() != null ? f.getFinancialYear() : "",
        "displayName", f.getDisplayName() != null ? f.getDisplayName() : "",
        "address", f.getAddress() != null ? f.getAddress() : "",
        "phone", f.getPhone() != null ? f.getPhone() : "",
        "logo", f.getLogo() != null ? f.getLogo() : ""
      )).toList());
  }


  @PostMapping
  public Firm create(@RequestBody FirmCreateRequest req) {
    if (req.name() == null || req.name().trim().isEmpty()) {
      throw new IllegalArgumentException("Firm name is required");
    }
    
    // Generate a unique firm code using name prefix + random 4 digit suffix
    String prefix = req.name().replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
    if (prefix.length() > 6) {
      prefix = prefix.substring(0, 6);
    } else if (prefix.isEmpty()) {
      prefix = "FRM";
    }
    String code = prefix + String.format("%04d", (int)(Math.random() * 10000));
    if (code.length() > 32) {
      code = code.substring(0, 32);
    }

    Firm f = new Firm();
    f.setCode(code);
    f.setName(req.name().trim());
    f.setBookStartDate(req.bookStartDate());
    f.setBusinessType(req.businessType());
    f.setFinancialYear(req.financialYear());
    f.setDisplayName(req.displayName() != null ? req.displayName().trim() : null);
    f.setAddress(req.address() != null ? req.address().trim() : null);
    f.setPhone(req.phone() != null ? req.phone().trim() : null);
    f.setLogo(req.logo());
    f.setActive(true);

    return firms.save(f);
  }

  public record FirmCreateRequest(
    String name,
    LocalDate bookStartDate,
    String businessType,
    String financialYear,
    String displayName,
    String address,
    String phone,
    String logo
  ) {}
}

