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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ShopSettingService shopSettingService;
    private final java.util.concurrent.atomic.AtomicLong invoiceCounter = new java.util.concurrent.atomic.AtomicLong(System.currentTimeMillis() % 9000 + 1000);

    public BillingService(OrderRepository orderRepository,
                          ProductRepository productRepository,
                          CustomerRepository customerRepository,
                          UserRepository userRepository,
                          InventoryTransactionRepository inventoryTransactionRepository,
                          ShopSettingService shopSettingService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.shopSettingService = shopSettingService;
    }

    @Transactional
    public OrderResponseDto createOrder(CreateOrderRequest request) {
        // Idempotency check: if order was already synced with this client UUID, return existing order
        if (request.getClientOrderUuid() != null && !request.getClientOrderUuid().trim().isEmpty()) {
            Optional<Order> existingOrder = orderRepository.findByClientOrderUuid(request.getClientOrderUuid().trim());
            if (existingOrder.isPresent()) {
                return mapToResponseDto(existingOrder.get());
            }
        }

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

        // Determine invoice number
        String invoiceNumber;
        if (request.getOfflineInvoiceNumber() != null && !request.getOfflineInvoiceNumber().trim().isEmpty()) {
            String offInv = request.getOfflineInvoiceNumber().trim();
            if (!orderRepository.existsByInvoiceNumber(offInv)) {
                invoiceNumber = offInv;
            } else {
                invoiceNumber = generateInvoiceNumber();
            }
        } else {
            invoiceNumber = generateInvoiceNumber();
        }
        order.setInvoiceNumber(invoiceNumber);

        if (request.getClientOrderUuid() != null && !request.getClientOrderUuid().trim().isEmpty()) {
            order.setClientOrderUuid(request.getClientOrderUuid().trim());
        }

        if (request.getCreatedAt() != null) {
            order.setCreatedAt(request.getCreatedAt());
        } else {
            order.setCreatedAt(LocalDateTime.now());
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        List<InventoryTransaction> transactions = new java.util.ArrayList<>();

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            Product product = null;
            BigDecimal unitPrice;
            BigDecimal taxRate;
            String productName;

            if (itemReq.getProductId() != null) {
                product = productRepository.findByIdWithLock(itemReq.getProductId()).orElse(null);
            }

            if (product != null) {
                if (!product.isActive()) {
                    throw new BadRequestException("Product '" + product.getName() + "' is inactive and cannot be sold");
                }

                unitPrice = product.getSellingPrice();
                taxRate = product.getTaxRate() != null ? product.getTaxRate() : BigDecimal.ZERO;
                productName = product.getName();

                BigDecimal currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : BigDecimal.ZERO;
                // Live orders strictly check stock; offline synced orders allow stock to update without rejecting the bill
                if (request.getClientOrderUuid() == null && currentStock.compareTo(itemReq.getQuantity()) < 0) {
                    throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                            "'. Requested: " + itemReq.getQuantity() + " " + product.getUnit() +
                            ", Available: " + currentStock + " " + product.getUnit());
                }

                // Deduct stock
                BigDecimal newStock = currentStock.subtract(itemReq.getQuantity());
                product.setStockQuantity(newStock);

                transactions.add(new InventoryTransaction(
                        product,
                        itemReq.getQuantity().negate(),
                        newStock,
                        "SALE",
                        "POS Order " + order.getInvoiceNumber(),
                        cashier
                ));
            } else {
                // Custom or miscellaneous line item
                unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                taxRate = itemReq.getTaxRate() != null ? itemReq.getTaxRate() : BigDecimal.ZERO;
                productName = (itemReq.getCustomItemName() != null && !itemReq.getCustomItemName().trim().isEmpty())
                        ? itemReq.getCustomItemName().trim()
                        : "Custom Bakery Item";
            }

            BigDecimal quantity = itemReq.getQuantity();
            BigDecimal lineTotal = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
            BigDecimal itemTax = lineTotal.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(lineTotal);
            totalTax = totalTax.add(itemTax);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductNameSnapshot(productName);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPriceSnapshot(unitPrice);
            orderItem.setTaxRateSnapshot(taxRate);
            orderItem.setLineTotal(lineTotal);

            order.addOrderItem(orderItem);
        }

        // Batch save inventory transactions
        if (!transactions.isEmpty()) {
            inventoryTransactionRepository.saveAll(transactions);
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

    @Transactional
    public List<OrderResponseDto> syncOfflineBatch(List<CreateOrderRequest> requests) {
        List<OrderResponseDto> syncedOrders = new java.util.ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return syncedOrders;
        }

        for (CreateOrderRequest req : requests) {
            try {
                syncedOrders.add(createOrder(req));
            } catch (Exception ex) {
                // If single order fails, skip or log to allow others to sync
            }
        }
        return syncedOrders;
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
        String prefix = shopSettingService.getCachedInvoicePrefix();
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        for (int i = 0; i < 20; i++) {
            long seq = invoiceCounter.incrementAndGet() % 10000;
            String candidate = String.format("%s-%s-%04d", prefix, datePart, seq);
            if (!orderRepository.existsByInvoiceNumber(candidate)) {
                return candidate;
            }
        }
        long ts = System.currentTimeMillis() % 100000;
        int rand = java.util.concurrent.ThreadLocalRandom.current().nextInt(100, 999);
        return String.format("%s-%s-%05d%03d", prefix, datePart, ts, rand);
    }

    public OrderResponseDto mapToResponseDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setInvoiceNumber(order.getInvoiceNumber());
        dto.setClientOrderUuid(order.getClientOrderUuid());
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
