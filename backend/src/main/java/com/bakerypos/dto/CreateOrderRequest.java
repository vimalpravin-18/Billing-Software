package com.bakerypos.dto;

import com.bakerypos.entity.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CreateOrderRequest {

    private Long customerId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String clientOrderUuid;
    private String offlineInvoiceNumber;
    private LocalDateTime createdAt;
    private String notes;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<CreateOrderItemRequest> items;

    public CreateOrderRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getClientOrderUuid() { return clientOrderUuid; }
    public void setClientOrderUuid(String clientOrderUuid) { this.clientOrderUuid = clientOrderUuid; }

    public String getOfflineInvoiceNumber() { return offlineInvoiceNumber; }
    public void setOfflineInvoiceNumber(String offlineInvoiceNumber) { this.offlineInvoiceNumber = offlineInvoiceNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<CreateOrderItemRequest> getItems() { return items; }
    public void setItems(List<CreateOrderItemRequest> items) { this.items = items; }
}
