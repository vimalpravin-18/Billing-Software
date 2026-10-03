package com.bakerypos.controller;

import com.bakerypos.dto.CreateOrderRequest;
import com.bakerypos.dto.OrderResponseDto;
import com.bakerypos.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponseDto order = billingService.createOrder(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(billingService.getAllOrders());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders() {
        return ResponseEntity.ok(billingService.getMyOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getOrderById(id));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<OrderResponseDto> getOrderByInvoiceNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(billingService.getOrderByInvoiceNumber(invoiceNumber));
    }
}
