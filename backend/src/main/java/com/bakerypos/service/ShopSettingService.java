package com.bakerypos.service;

import com.bakerypos.dto.ShopSettingDto;
import com.bakerypos.entity.ShopSetting;
import com.bakerypos.repository.ShopSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ShopSettingService {

    private final ShopSettingRepository shopSettingRepository;

    public ShopSettingService(ShopSettingRepository shopSettingRepository) {
        this.shopSettingRepository = shopSettingRepository;
    }

    public ShopSettingDto getShopSetting() {
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
            return mapToDto(saved);
        }
        return mapToDto(list.get(0));
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
        return mapToDto(saved);
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
