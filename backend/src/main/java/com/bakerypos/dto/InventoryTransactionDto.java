package com.bakerypos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryTransactionDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal quantityChange;
    private BigDecimal resultStock;
    private String transactionType;
    private String reason;
    private String userName;
    private LocalDateTime createdAt;

    public InventoryTransactionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getQuantityChange() { return quantityChange; }
    public void setQuantityChange(BigDecimal quantityChange) { this.quantityChange = quantityChange; }

    public BigDecimal getResultStock() { return resultStock; }
    public void setResultStock(BigDecimal resultStock) { this.resultStock = resultStock; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
