package com.brt.customer;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
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

    // Other Details
    @Column(name = "guarantor")
    private String guarantor;

    @Column(name = "credit_amt", precision = 12, scale = 2)
    private BigDecimal creditAmt = BigDecimal.ZERO;

    @Column(name = "credit_days")
    private Integer creditDays = 0;

    @Column(name = "gst", length = 100)
    private String gst;

    @Column(name = "mst", length = 100)
    private String mst;

    @Column(name = "cst", length = 100)
    private String cst;

    @Column(name = "ecc_no", length = 100)
    private String eccNo;

    @Column(name = "range", length = 100)
    private String range;

    @Column(name = "division", length = 100)
    private String division;

    @Column(name = "collector", length = 100)
    private String collector;

    @Column(name = "pati_code", length = 100)
    private String patiCode;

    @Column(name = "marriage_date")
    private LocalDate marriageDate;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "monthly_wages", precision = 12, scale = 2)
    private BigDecimal monthlyWages = BigDecimal.ZERO;

    // RTGS Details
    @Column(name = "rtgs_ifsc", length = 50)
    private String rtgsIfsc;

    @Column(name = "rtgs_bank_name")
    private String rtgsBankName;

    @Column(name = "rtgs_branch_name")
    private String rtgsBranchName;

    @Column(name = "rtgs_location")
    private String rtgsLocation;

    @Column(name = "rtgs_ac_no", length = 100)
    private String rtgsAcNo;

    @Column(name = "rtgs_ac_type", length = 100)
    private String rtgsAcType;

    @Column(name = "rtgs_ac_no_confirm", length = 100)
    private String rtgsAcNoConfirm;

    @Column(name = "rtgs_form_no", length = 100)
    private String rtgsFormNo;

    @Column(name = "rtgs_format", length = 100)
    private String rtgsFormat;

    @Column(name = "rtgs_report", length = 100)
    private String rtgsReport;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

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
