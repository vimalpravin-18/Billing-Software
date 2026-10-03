package com.bakerypos.dto;

import java.math.BigDecimal;

public class ShopSettingDto {
    private Long id;
    private String shopName;
    private String address;
    private String phone;
    private String email;
    private String invoicePrefix;
    private BigDecimal defaultTaxRate;
    private String currencySymbol;
    private String receiptFooterText;

    public ShopSettingDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getInvoicePrefix() { return invoicePrefix; }
    public void setInvoicePrefix(String invoicePrefix) { this.invoicePrefix = invoicePrefix; }

    public BigDecimal getDefaultTaxRate() { return defaultTaxRate; }
    public void setDefaultTaxRate(BigDecimal defaultTaxRate) { this.defaultTaxRate = defaultTaxRate; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public String getReceiptFooterText() { return receiptFooterText; }
    public void setReceiptFooterText(String receiptFooterText) { this.receiptFooterText = receiptFooterText; }
}
