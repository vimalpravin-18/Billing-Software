package com.bakerypos.service;

import com.bakerypos.dto.InventoryTransactionDto;
import com.bakerypos.dto.StockAdjustmentRequest;
import com.bakerypos.entity.InventoryTransaction;
import com.bakerypos.entity.Product;
import com.bakerypos.entity.User;
import com.bakerypos.exception.BadRequestException;
import com.bakerypos.exception.ResourceNotFoundException;
import com.bakerypos.repository.InventoryTransactionRepository;
import com.bakerypos.repository.ProductRepository;
import com.bakerypos.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final UserRepository userRepository;

    public InventoryService(ProductRepository productRepository, InventoryTransactionRepository inventoryTransactionRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InventoryTransactionDto adjustStock(StockAdjustmentRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        BigDecimal newStock = product.getStockQuantity().add(request.getQuantityChange());
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Stock cannot be negative. Current stock: " + product.getStockQuantity());
        }

        product.setStockQuantity(newStock);
        productRepository.save(product);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElse(null);

        InventoryTransaction transaction = new InventoryTransaction(
                product,
                request.getQuantityChange(),
                newStock,
                "MANUAL_ADJUSTMENT",
                request.getReason(),
                user
        );

        InventoryTransaction saved = inventoryTransactionRepository.save(transaction);
        return mapToDto(saved);
    }

    public List<InventoryTransactionDto> getTransactionsByProduct(Long productId) {
        return inventoryTransactionRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InventoryTransactionDto> getAllTransactions() {
        return inventoryTransactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private InventoryTransactionDto mapToDto(InventoryTransaction tx) {
        InventoryTransactionDto dto = new InventoryTransactionDto();
        dto.setId(tx.getId());
        dto.setProductId(tx.getProduct().getId());
        dto.setProductName(tx.getProduct().getName());
        dto.setQuantityChange(tx.getQuantityChange());
        dto.setResultStock(tx.getResultStock());
        dto.setTransactionType(tx.getTransactionType());
        dto.setReason(tx.getReason());
        dto.setUserName(tx.getUser() != null ? tx.getUser().getFullName() : "System");
        dto.setCreatedAt(tx.getCreatedAt());
        return dto;
    }
}
