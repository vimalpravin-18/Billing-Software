package com.bakerypos.controller;

import com.bakerypos.dto.ShopSettingDto;
import com.bakerypos.service.ShopSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class ShopSettingController {

    private final ShopSettingService shopSettingService;

    public ShopSettingController(ShopSettingService shopSettingService) {
        this.shopSettingService = shopSettingService;
    }

    @GetMapping
    public ResponseEntity<ShopSettingDto> getShopSetting() {
        return ResponseEntity.ok(shopSettingService.getShopSetting());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShopSettingDto> updateShopSetting(@Valid @RequestBody ShopSettingDto dto) {
        return ResponseEntity.ok(shopSettingService.updateShopSetting(dto));
    }
}
