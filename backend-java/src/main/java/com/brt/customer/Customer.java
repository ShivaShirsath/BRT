package com.brt.customer;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "customer", schema = "mst")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "firm_id", nullable = false, length = 32)
    private String firmId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "category", length = 10)
    private String category = "B";

    @Column(name = "english_name")
    private String englishName;

    @Column(name = "short_name", length = 100)
    private String shortName;

    @Column(name = "account_type", length = 100)
    private String accountType;

    @Column(name = "opening_balance", precision = 12, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "opening_balance_type", length = 5)
    private String openingBalanceType = "D";

    @Column(name = "firm_account_no", length = 100)
    private String firmAccountNo;

    @Column(name = "group_name")
    private String groupName = "Current Liabilities";

    @Column(name = "user_group", length = 100)
    private String userGroup;

    @Column(name = "location_type", length = 50)
    private String locationType = "LOCAL";

    @Column(name = "location_state", length = 100)
    private String locationState = "Maharashtra";

    @Column(name = "packing_charges", precision = 12, scale = 2)
    private BigDecimal packingCharges = BigDecimal.ZERO;

    @Column(name = "levy", length = 100)
    private String levy;

    @Column(name = "sawangadi_no", length = 100)
    private String sawangadiNo;

    // Personal details
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "email")
    private String email;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "zone", length = 100)
    private String zone;

    @Column(name = "taluka", length = 100)
    private String taluka;

    @Column(name = "dist", length = 100)
    private String dist;

    @Column(name = "pin", length = 20)
    private String pin;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "state_name", length = 100)
    private String stateName;

    @Column(name = "mobile_no", length = 50)
    private String mobileNo;

    @Column(name = "mobile_2nd", length = 50)
    private String mobile2nd;

    @Column(name = "aadhar_no", length = 50)
    private String aadharNo;

    @Column(name = "pan_no", length = 50)
    private String panNo;

    @Column(name = "license_no", length = 100)
    private String licenseNo;

    @Column(name = "tin_no", length = 100)
    private String tinNo;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
