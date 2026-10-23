package com.bakerypos.service;

import com.bakerypos.dto.DashboardSummaryDto;
import com.bakerypos.repository.CustomerRepository;
import com.bakerypos.repository.OrderItemRepository;
import com.bakerypos.repository.OrderRepository;
import com.bakerypos.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    @DisplayName("Should aggregate dashboard summary with optimized DB count and limit 5")
    void testGetDashboardSummary() {
        when(orderRepository.sumTotalAmountBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("12500.00"));
        when(orderRepository.countOrdersBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(42L);
        when(productRepository.countLowStockProducts()).thenReturn(3L);
        when(productRepository.count()).thenReturn(65L);
        when(customerRepository.count()).thenReturn(120L);

        List<Object[]> topList = new java.util.ArrayList<>();
        topList.add(new Object[]{"Belgian Chocolate Cake", new BigDecimal("12.000"), new BigDecimal("6000.00")});
        when(orderItemRepository.findTopSellingProductsBetween(any(LocalDateTime.class), any(LocalDateTime.class), eq(PageRequest.of(0, 5))))
                .thenReturn(topList);

        List<Object[]> payList = new java.util.ArrayList<>();
        payList.add(new Object[]{"CASH", 30L, new BigDecimal("8500.00")});
        when(orderRepository.getSalesByPaymentMethodBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(payList);

        DashboardSummaryDto result = reportService.getDashboardSummary();

        assertThat(result).isNotNull();
        assertThat(result.getTodaySales()).isEqualByComparingTo(new BigDecimal("12500.00"));
        assertThat(result.getTodayOrdersCount()).isEqualTo(42L);
        assertThat(result.getLowStockCount()).isEqualTo(3L);
        assertThat(result.getTotalProducts()).isEqualTo(65L);
        assertThat(result.getTotalCustomers()).isEqualTo(120L);
        assertThat(result.getTopProducts()).hasSize(1);
        assertThat(result.getTopProducts().get(0).getName()).isEqualTo("Belgian Chocolate Cake");
        assertThat(result.getPaymentMethodSummary()).hasSize(1);

        // Verify countLowStockProducts was called (not findLowStockProducts)
        verify(productRepository, times(1)).countLowStockProducts();
        verify(productRepository, never()).findLowStockProducts();
        // Verify PageRequest.of(0, 5) was passed to orderItemRepository
        verify(orderItemRepository, times(1)).findTopSellingProductsBetween(any(), any(), eq(PageRequest.of(0, 5)));
    }
}
