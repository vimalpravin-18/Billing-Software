package com.bakerypos.service;

import com.bakerypos.dto.ShopSettingDto;
import com.bakerypos.entity.ShopSetting;
import com.bakerypos.repository.ShopSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class ShopSettingService {

    private final ShopSettingRepository shopSettingRepository;
    private final AtomicReference<ShopSettingDto> cachedSetting = new AtomicReference<>();

    public ShopSettingService(ShopSettingRepository shopSettingRepository) {
        this.shopSettingRepository = shopSettingRepository;
    }

    @Transactional(readOnly = true)
    public ShopSettingDto getShopSetting() {
        ShopSettingDto cached = cachedSetting.get();
        if (cached != null) {
            return cached;
        }

        List<ShopSetting> list = shopSettingRepository.findAll();
        if (list.isEmpty()) {
            ShopSetting defaultSetting = new ShopSetting();
            defaultSetting.setShopName("Sweet Delights Bakery");
            defaultSetting.setAddress("123 Baker Street, Suite 4");
            defaultSetting.setPhone("+1 (555) 019-2834");
            defaultSetting.setEmail("contact@sweetdelights.com");
            defaultSetting.setInvoicePrefix("INV");
            defaultSetting.setDefaultTaxRate(new BigDecimal("5.00"));
            defaultSetting.setCurrencySymbol("₹");
            defaultSetting.setReceiptFooterText("Thank you for visiting Sweet Delights Bakery! Have a sweet day!");
            ShopSetting saved = shopSettingRepository.save(defaultSetting);
            ShopSettingDto dto = mapToDto(saved);
            cachedSetting.set(dto);
            return dto;
        }

        ShopSettingDto dto = mapToDto(list.get(0));
        cachedSetting.set(dto);
        return dto;
    }

    public String getCachedInvoicePrefix() {
        ShopSettingDto setting = cachedSetting.get();
        if (setting == null) {
            setting = getShopSetting();
        }
        return setting.getInvoicePrefix() != null ? setting.getInvoicePrefix() : "INV";
    }

    @Transactional
    public ShopSettingDto updateShopSetting(ShopSettingDto dto) {
        List<ShopSetting> list = shopSettingRepository.findAll();
        ShopSetting setting = list.isEmpty() ? new ShopSetting() : list.get(0);

        setting.setShopName(dto.getShopName());
        setting.setAddress(dto.getAddress());
        setting.setPhone(dto.getPhone());
        setting.setEmail(dto.getEmail());
        setting.setInvoicePrefix(dto.getInvoicePrefix());
        setting.setDefaultTaxRate(dto.getDefaultTaxRate());
        setting.setCurrencySymbol(dto.getCurrencySymbol());
        setting.setReceiptFooterText(dto.getReceiptFooterText());

        ShopSetting saved = shopSettingRepository.save(setting);
        ShopSettingDto updatedDto = mapToDto(saved);
        cachedSetting.set(updatedDto);
        return updatedDto;
    }

    private ShopSettingDto mapToDto(ShopSetting setting) {
        ShopSettingDto dto = new ShopSettingDto();
        dto.setId(setting.getId());
        dto.setShopName(setting.getShopName());
        dto.setAddress(setting.getAddress());
        dto.setPhone(setting.getPhone());
        dto.setEmail(setting.getEmail());
        dto.setInvoicePrefix(setting.getInvoicePrefix());
        dto.setDefaultTaxRate(setting.getDefaultTaxRate());
        dto.setCurrencySymbol(setting.getCurrencySymbol());
        dto.setReceiptFooterText(setting.getReceiptFooterText());
        return dto;
    }
}
