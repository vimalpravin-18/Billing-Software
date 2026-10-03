package com.bakerypos.service;

import com.bakerypos.dto.CreateOrderItemRequest;
import com.bakerypos.dto.CreateOrderRequest;
import com.bakerypos.dto.OrderItemResponseDto;
import com.bakerypos.dto.OrderResponseDto;
import com.bakerypos.entity.*;
import com.bakerypos.entity.enums.OrderStatus;
import com.bakerypos.entity.enums.PaymentStatus;
import com.bakerypos.exception.BadRequestException;
import com.bakerypos.exception.InsufficientStockException;
import com.bakerypos.exception.ResourceNotFoundException;
import com.bakerypos.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ShopSettingRepository shopSettingRepository;

    public BillingService(OrderRepository orderRepository,
                          ProductRepository productRepository,
                          CustomerRepository customerRepository,
                          UserRepository userRepository,
                          InventoryTransactionRepository inventoryTransactionRepository,
                          ShopSettingRepository shopSettingRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.shopSettingRepository = shopSettingRepository;
    }

    @Transactional
    public OrderResponseDto createOrder(CreateOrderRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User cashier = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier user not found: " + username));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        Order order = new Order();
        order.setCashierUser(cashier);
        order.setCustomer(customer);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setOrderStatus(OrderStatus.COMPLETED);
        order.setInvoiceNumber(generateInvoiceNumber());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is inactive and cannot be sold");
            }

            if (product.getStockQuantity().compareTo(itemReq.getQuantity()) < 0) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Requested: " + itemReq.getQuantity() + " " + product.getUnit() +
                        ", Available: " + product.getStockQuantity() + " " + product.getUnit());
            }

            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal taxRate = product.getTaxRate();
            BigDecimal quantity = itemReq.getQuantity();

            BigDecimal lineTotal = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemTax = lineTotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(lineTotal);
            totalTax = totalTax.add(itemTax);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductNameSnapshot(product.getName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPriceSnapshot(unitPrice);
            orderItem.setTaxRateSnapshot(taxRate);
            orderItem.setLineTotal(lineTotal);

            order.addOrderItem(orderItem);

            // Deduct stock & log inventory transaction
            BigDecimal newStock = product.getStockQuantity().subtract(quantity);
            product.setStockQuantity(newStock);
            productRepository.save(product);

            InventoryTransaction tx = new InventoryTransaction(
                    product,
                    quantity.negate(),
                    newStock,
                    "SALE",
                    "POS Order " + order.getInvoiceNumber(),
                    cashier
            );
            inventoryTransactionRepository.save(tx);
        }

        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal; // Discount cannot exceed subtotal
        }

        BigDecimal grandTotal = subtotal.subtract(discount).add(totalTax).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setTaxAmount(totalTax);
        order.setTotalAmount(grandTotal);

        Order savedOrder = orderRepository.save(order);
        return mapToResponseDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderByInvoiceNumber(String invoiceNumber) {
        Order order = orderRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with invoice: " + invoiceNumber));
        return mapToResponseDto(order);
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToResponseDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);

        List<Order> orders;
        if (currentUser != null && currentUser.getRole().name().equals("ROLE_STAFF")) {
            orders = orderRepository.findByCashierUserIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        return orders.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return orderRepository.findByCashierUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private synchronized String generateInvoiceNumber() {
        String prefix = "INV";
        List<ShopSetting> settings = shopSettingRepository.findAll();
        if (!settings.isEmpty() && settings.get(0).getInvoicePrefix() != null) {
            prefix = settings.get(0).getInvoicePrefix();
        }

        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long nextId = orderRepository.count() + 1;
        return String.format("%s-%s-%04d", prefix, datePart, nextId);
    }

    public OrderResponseDto mapToResponseDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setInvoiceNumber(order.getInvoiceNumber());
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getName());
            dto.setCustomerPhone(order.getCustomer().getPhone());
        } else {
            dto.setCustomerName("Walk-in Customer");
        }
        dto.setCashierId(order.getCashierUser().getId());
        dto.setCashierName(order.getCashierUser().getFullName());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setOrderStatus(order.getOrderStatus().name());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemResponseDto> itemDtos = order.getOrderItems().stream().map(item -> {
            OrderItemResponseDto itemDto = new OrderItemResponseDto();
            itemDto.setId(item.getId());
            if (item.getProduct() != null) {
                itemDto.setProductId(item.getProduct().getId());
            }
            itemDto.setProductName(item.getProductNameSnapshot());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPriceSnapshot());
            itemDto.setTaxRate(item.getTaxRateSnapshot());
            itemDto.setLineTotal(item.getLineTotal());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}
