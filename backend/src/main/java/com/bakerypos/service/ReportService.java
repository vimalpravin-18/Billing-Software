package com.bakerypos.service;

import com.bakerypos.dto.DashboardSummaryDto;
import com.bakerypos.repository.CustomerRepository;
import com.bakerypos.repository.OrderItemRepository;
import com.bakerypos.repository.OrderRepository;
import com.bakerypos.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public ReportService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, ProductRepository productRepository, CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        BigDecimal todaySales = orderRepository.sumTotalAmountBetween(startOfDay, endOfDay);
        long todayOrders = orderRepository.countOrdersBetween(startOfDay, endOfDay);
        long lowStockCount = productRepository.findLowStockProducts().size();
        long totalProducts = productRepository.count();
        long totalCustomers = customerRepository.count();

        // Top 5 selling products today
        List<Object[]> topProdObjects = orderItemRepository.findTopSellingProductsBetween(startOfDay, endOfDay);
        List<DashboardSummaryDto.TopProductDto> topProducts = topProdObjects.stream()
                .limit(5)
                .map(obj -> new DashboardSummaryDto.TopProductDto(
                        (String) obj[0],
                        (BigDecimal) obj[1],
                        (BigDecimal) obj[2]
                ))
                .collect(Collectors.toList());

        // Payment method breakdown
        List<Object[]> paymentObjects = orderRepository.getSalesByPaymentMethodBetween(startOfDay, endOfDay);
        List<DashboardSummaryDto.PaymentMethodSummaryDto> paymentSummary = paymentObjects.stream()
                .map(obj -> new DashboardSummaryDto.PaymentMethodSummaryDto(
                        obj[0].toString(),
                        ((Number) obj[1]).longValue(),
                        (BigDecimal) obj[2]
                ))
                .collect(Collectors.toList());

        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setTodaySales(todaySales);
        dto.setTodayOrdersCount(todayOrders);
        dto.setLowStockCount(lowStockCount);
        dto.setTotalProducts(totalProducts);
        dto.setTotalCustomers(totalCustomers);
        dto.setTopProducts(topProducts);
        dto.setPaymentMethodSummary(paymentSummary);

        return dto;
    }
}
