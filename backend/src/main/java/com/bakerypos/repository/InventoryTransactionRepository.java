package com.bakerypos.repository;

import com.bakerypos.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    @EntityGraph(attributePaths = {"product", "user"})
    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    @EntityGraph(attributePaths = {"product", "user"})
    List<InventoryTransaction> findAllByOrderByCreatedAtDesc();
}
