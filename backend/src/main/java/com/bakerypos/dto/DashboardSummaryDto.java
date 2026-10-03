package com.bakerypos.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDto {
    private BigDecimal todaySales;
    private long todayOrdersCount;
    private long lowStockCount;
    private long totalProducts;
    private long totalCustomers;
    private List<TopProductDto> topProducts;
    private List<PaymentMethodSummaryDto> paymentMethodSummary;

    public DashboardSummaryDto() {}

    public BigDecimal getTodaySales() { return todaySales; }
    public void setTodaySales(BigDecimal todaySales) { this.todaySales = todaySales; }

    public long getTodayOrdersCount() { return todayOrdersCount; }
    public void setTodayOrdersCount(long todayOrdersCount) { this.todayOrdersCount = todayOrdersCount; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public List<TopProductDto> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDto> topProducts) { this.topProducts = topProducts; }

    public List<PaymentMethodSummaryDto> getPaymentMethodSummary() { return paymentMethodSummary; }
    public void setPaymentMethodSummary(List<PaymentMethodSummaryDto> paymentMethodSummary) { this.paymentMethodSummary = paymentMethodSummary; }

    public static class TopProductDto {
        private String name;
        private BigDecimal quantitySold;
        private BigDecimal totalRevenue;

        public TopProductDto(String name, BigDecimal quantitySold, BigDecimal totalRevenue) {
            this.name = name;
            this.quantitySold = quantitySold;
            this.totalRevenue = totalRevenue;
        }

        public String getName() { return name; }
        public BigDecimal getQuantitySold() { return quantitySold; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
    }

    public static class PaymentMethodSummaryDto {
        private String paymentMethod;
        private long orderCount;
        private BigDecimal totalAmount;

        public PaymentMethodSummaryDto(String paymentMethod, long orderCount, BigDecimal totalAmount) {
            this.paymentMethod = paymentMethod;
            this.orderCount = orderCount;
            this.totalAmount = totalAmount;
        }

        public String getPaymentMethod() { return paymentMethod; }
        public long getOrderCount() { return orderCount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
    }
}
