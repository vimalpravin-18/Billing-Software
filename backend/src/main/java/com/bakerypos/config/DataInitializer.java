package com.bakerypos.config;

import com.bakerypos.entity.*;
import com.bakerypos.entity.enums.Role;
import com.bakerypos.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ShopSettingRepository shopSettingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CustomerRepository customerRepository,
                           ShopSettingRepository shopSettingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.shopSettingRepository = shopSettingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedShopSettings();
        if (categoryRepository.count() == 0) {
            seedCategoriesAndProducts();
        }
        seedCustomers();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", passwordEncoder.encode("admin123"), "Master Admin", Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("cashier")) {
            User cashier = new User("cashier", passwordEncoder.encode("cashier123"), "Jane Cashier", Role.ROLE_STAFF);
            userRepository.save(cashier);
        }
    }

    private void seedShopSettings() {
        if (shopSettingRepository.count() == 0) {
            ShopSetting setting = new ShopSetting();
            setting.setShopName("Sweet Delights Bakery & Cafe");
            setting.setAddress("42 Artisan Boulevard, Pastry District");
            setting.setPhone("+91 98765 43210");
            setting.setEmail("order@sweetdelights.com");
            setting.setInvoicePrefix("BAKE");
            setting.setDefaultTaxRate(new BigDecimal("5.00"));
            setting.setCurrencySymbol("₹");
            setting.setReceiptFooterText("Thank you for tasting happiness! Visit us again soon.");
            shopSettingRepository.save(setting);
        }
    }

    private void seedCategoriesAndProducts() {
        Category cakes = categoryRepository.save(new Category("Cakes", "Freshly baked artisan cakes for all celebrations"));
        Category pastries = categoryRepository.save(new Category("Pastries", "Single-serving creamy pastries and tarts"));
        Category bread = categoryRepository.save(new Category("Bread & Buns", "Daily fresh baked loaves, baguettes, and dinner rolls"));
        Category cookies = categoryRepository.save(new Category("Cookies & Biscuits", "Crunchy butter cookies, biscotti, and macarons"));
        Category savories = categoryRepository.save(new Category("Savories & Puffs", "Hot stuffed puffs, rolls, and quiches"));
        Category beverages = categoryRepository.save(new Category("Beverages", "Fresh coffees, teas, and milkshakes"));

        // Cakes
        createProduct("Belgian Chocolate Cake (1 Kg)", "Rich 70% dark chocolate layered cake", "CAKE-CHO-1KG", "890001", cakes, "850.00", "500.00", "5.00", "15.000", "3.000", "Kg", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500");
        createProduct("Red Velvet Cream Cheese Cake", "Classic red velvet with silky cream cheese frosting", "CAKE-RED-1KG", "890002", cakes, "950.00", "550.00", "5.00", "10.000", "2.000", "Kg", "https://images.unsplash.com/photo-1586788680404-3282110c490a?w=500");
        createProduct("Blueberry Cheesecake", "Baked New York style cheesecake with fresh blueberry compote", "CAKE-BLU-1KG", "890003", cakes, "1200.00", "700.00", "5.00", "8.000", "2.000", "Kg", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500");

        // Pastries
        createProduct("Black Forest Pastry", "Layered chocolate sponge with cherries and whipped cream", "PAS-BLK-PC", "890004", pastries, "90.00", "45.00", "5.00", "35.000", "5.000", "Piece", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500");
        createProduct("Mango Passion Tart", "Crisp pastry shell filled with mango curd", "PAS-MGO-PC", "890005", pastries, "110.00", "55.00", "5.00", "20.000", "5.000", "Piece", "https://images.unsplash.com/photo-1519869325930-281384150729?w=500");
        createProduct("Chocolate Eclair", "Chux pastry filled with vanilla custard, glazed with chocolate", "PAS-ECL-PC", "890006", pastries, "95.00", "48.00", "5.00", "25.000", "5.000", "Piece", "https://images.unsplash.com/photo-1612203985729-70726954388c?w=500");

        // Bread
        createProduct("Artisan Sourdough Loaf", "Naturally fermented sourdough with crispy golden crust", "BRD-SOUR-PC", "890007", bread, "160.00", "70.00", "0.00", "18.000", "4.000", "Piece", "https://images.unsplash.com/photo-1585478259715-876a6a81ae08?w=500");
        createProduct("French Butter Baguette", "Traditional crispy French baguette", "BRD-BAG-PC", "890008", bread, "80.00", "35.00", "0.00", "30.000", "5.000", "Piece", "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500");
        createProduct("Whole Wheat Sandwich Bread", "Soft sliced whole wheat bread", "BRD-WHT-PKT", "890009", bread, "55.00", "28.00", "0.00", "40.000", "8.000", "Packet", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500");

        // Cookies
        createProduct("Double Choc Chip Cookies (250g)", "Loaded with dark and milk chocolate chunks", "CK-CHOC-250G", "890010", cookies, "180.00", "90.00", "5.00", "25.000", "5.000", "Box", "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500");
        createProduct("French Butter Shortbread", "Melt-in-mouth Scottish recipe butter shortbread", "CK-SHRT-250G", "890011", cookies, "210.00", "105.00", "5.00", "20.000", "4.000", "Box", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500");

        // Savories
        createProduct("Spicy Chicken Puff", "Flaky puff pastry stuffed with minced chicken tikka", "PUF-CHK-PC", "890012", savories, "65.00", "30.00", "5.00", "50.000", "10.000", "Piece", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500");
        createProduct("Paneer Butter Masala Roll", "Flaky puff roll stuffed with cottage cheese", "PUF-PNR-PC", "890013", savories, "55.00", "25.00", "5.00", "45.000", "10.000", "Piece", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500");

        // Beverages
        createProduct("Iced Spanish Latte", "Espresso with condensed milk and chilled milk", "BEV-LAT-PC", "890014", beverages, "150.00", "50.00", "5.00", "60.000", "10.000", "Piece", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500");
        createProduct("Belgian Chocolate Milkshake", "Rich thick shake made with Belgian chocolate ice cream", "BEV-CHK-PC", "890015", beverages, "180.00", "70.00", "5.00", "50.000", "10.000", "Piece", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500");
    }

    private void seedCustomers() {
        if (customerRepository.count() == 0) {
            customerRepository.save(new Customer("Walk-in Customer", "0000000000", "walkin@bakery.com", "Counter Sale"));
            customerRepository.save(new Customer("Ananya Sharma", "9876543210", "ananya.sharma@example.com", "Apartment 4B, Sunrise Towers"));
            customerRepository.save(new Customer("Rahul Verma", "9812345678", "rahul.verma@example.com", "Villa 12, Green Glen Layout"));
        }
    }

    private void createProduct(String name, String desc, String sku, String barcode, Category category,
                              String price, String cost, String tax, String stock, String lowStock, String unit, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setSku(sku);
        p.setBarcode(barcode);
        p.setCategory(category);
        p.setSellingPrice(new BigDecimal(price));
        p.setCostPrice(new BigDecimal(cost));
        p.setTaxRate(new BigDecimal(tax));
        p.setStockQuantity(new BigDecimal(stock));
        p.setLowStockThreshold(new BigDecimal(lowStock));
        p.setUnit(unit);
        p.setImageUrl(imageUrl);
        p.setActive(true);
        productRepository.save(p);
    }
}
