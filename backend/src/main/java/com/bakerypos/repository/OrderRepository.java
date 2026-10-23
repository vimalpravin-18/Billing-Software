package com.bakerypos.repository;

import com.bakerypos.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer", "cashierUser", "orderItems", "orderItems.product"})
    Optional<Order> findByInvoiceNumber(String invoiceNumber);

    @Override
    @EntityGraph(attributePaths = {"customer", "cashierUser", "orderItems", "orderItems.product"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"customer", "cashierUser", "orderItems", "orderItems.product"})
    List<Order> findByCashierUserIdOrderByCreatedAtDesc(Long cashierUserId);

    @EntityGraph(attributePaths = {"customer", "cashierUser", "orderItems", "orderItems.product"})
    List<Order> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"customer", "cashierUser", "orderItems", "orderItems.product"})
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end")
    long countOrdersBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.orderStatus = 'COMPLETED'")
    BigDecimal sumTotalAmountBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o.paymentMethod, COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.orderStatus = 'COMPLETED' GROUP BY o.paymentMethod")
    List<Object[]> getSalesByPaymentMethodBetween(LocalDateTime start, LocalDateTime end);
}
