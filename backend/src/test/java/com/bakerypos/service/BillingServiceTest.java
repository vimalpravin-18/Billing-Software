package com.bakerypos.service;

import com.bakerypos.dto.CreateOrderItemRequest;
import com.bakerypos.dto.CreateOrderRequest;
import com.bakerypos.dto.OrderResponseDto;
import com.bakerypos.entity.Category;
import com.bakerypos.entity.Order;
import com.bakerypos.entity.Product;
import com.bakerypos.entity.User;
import com.bakerypos.entity.enums.PaymentMethod;
import com.bakerypos.entity.enums.Role;
import com.bakerypos.exception.InsufficientStockException;
import com.bakerypos.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private ShopSettingService shopSettingService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private BillingService billingService;

    private User cashier;
    private Product cake;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("cashier");

        cashier = new User("cashier", "passHash", "Jane Cashier", Role.ROLE_STAFF);
        cashier.setId(2L);

        Category cat = new Category("Cakes", "Fresh cakes");
        cat.setId(1L);

        cake = new Product();
        cake.setId(10L);
        cake.setName("Chocolate Truffle Cake");
        cake.setSku("CAKE-TRF-1KG");
        cake.setCategory(cat);
        cake.setSellingPrice(new BigDecimal("500.00"));
        cake.setCostPrice(new BigDecimal("300.00"));
        cake.setTaxRate(new BigDecimal("5.00"));
        cake.setStockQuantity(new BigDecimal("10.000"));
        cake.setLowStockThreshold(new BigDecimal("2.000"));
        cake.setUnit("Kg");
        cake.setActive(true);
    }

    @Test
    @DisplayName("Should create order successfully, lock product, deduct stock, and calculate exact totals")
    void testCreateOrderSuccess() {
        when(userRepository.findByUsername("cashier")).thenReturn(Optional.of(cashier));
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(cake));
        when(shopSettingService.getCachedInvoicePrefix()).thenReturn("BAKE");
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(101L);
            return o;
        });

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setProductId(10L);
        item.setQuantity(new BigDecimal("2.000"));

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setDiscountAmount(new BigDecimal("50.00"));
        request.setItems(List.of(item));

        OrderResponseDto response = billingService.createOrder(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getInvoiceNumber()).startsWith("BAKE-");
        // Subtotal = 500 * 2 = 1000.00
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("1000.00"));
        // Tax = 1000 * 5% = 50.00
        assertThat(response.getTaxAmount()).isEqualByComparingTo(new BigDecimal("50.00"));
        // Discount = 50.00
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("50.00"));
        // Grand Total = 1000 - 50 + 50 = 1000.00
        assertThat(response.getTotalAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));

        // Verify stock deducted from 10 to 8
        assertThat(cake.getStockQuantity()).isEqualByComparingTo(new BigDecimal("8.000"));

        // Verify pessimistic lock query was used
        verify(productRepository, times(1)).findByIdWithLock(10L);
        // Verify inventory transactions saved in batch
        verify(inventoryTransactionRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Should fail when requested quantity exceeds available stock")
    void testCreateOrderInsufficientStock() {
        when(userRepository.findByUsername("cashier")).thenReturn(Optional.of(cashier));
        when(productRepository.findByIdWithLock(10L)).thenReturn(Optional.of(cake));

        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setProductId(10L);
        item.setQuantity(new BigDecimal("15.000")); // Cake only has 10 in stock

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setItems(List.of(item));

        assertThatThrownBy(() -> billingService.createOrder(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");

        // Stock should remain untouched
        assertThat(cake.getStockQuantity()).isEqualByComparingTo(new BigDecimal("10.000"));
        verify(orderRepository, never()).save(any());
    }
}
