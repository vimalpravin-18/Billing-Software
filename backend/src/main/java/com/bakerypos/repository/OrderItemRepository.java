package com.bakerypos.repository;

import com.bakerypos.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi.productNameSnapshot, SUM(oi.quantity), SUM(oi.lineTotal) FROM OrderItem oi JOIN oi.order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.orderStatus = 'COMPLETED' GROUP BY oi.productNameSnapshot ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProductsBetween(LocalDateTime start, LocalDateTime end);
}
