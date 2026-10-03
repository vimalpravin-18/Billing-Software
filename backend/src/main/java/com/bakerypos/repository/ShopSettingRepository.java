package com.bakerypos.repository;

import com.bakerypos.entity.ShopSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopSettingRepository extends JpaRepository<ShopSetting, Long> {
}
