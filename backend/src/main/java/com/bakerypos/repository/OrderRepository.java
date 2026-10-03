package com.bakerypos.repository;

import com.bakerypos.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
    List<Order> findByCashierUserIdOrderByCreatedAtDesc(Long cashierUserId);
    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end")
    long countOrdersBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.orderStatus = 'COMPLETED'")
    BigDecimal sumTotalAmountBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o.paymentMethod, COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.orderStatus = 'COMPLETED' GROUP BY o.paymentMethod")
    List<Object[]> getSalesByPaymentMethodBetween(LocalDateTime start, LocalDateTime end);
}
