import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import InvoicePrintModal from '../components/invoice/InvoicePrintModal';
import ProductImage from '../components/pos/ProductImage';
import ViewAllItemsModal from '../components/pos/ViewAllItemsModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  QrCode,
  ShoppingBag,
  Receipt,
  Printer,
  X,
  Check,
  UserPlus,
  RefreshCw,
  Eye,
  Package,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_BAKERY_IMAGE = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';

const formatUnit = (unit) => {
  if (!unit) return 'pc';
  const u = String(unit).trim().toLowerCase();
  if (u === 'kg' || u === 'kilogram') return 'kg';
  if (u === 'gram' || u === 'gm' || u === 'g') return 'gm';
  if (u === 'piece' || u === 'pcs' || u === 'pc') return 'pc';
  if (u === 'packet' || u === 'pack' || u === 'pkt' || u === 'pkts') return 'pkt';
  if (u === 'box' || u === 'boxes') return 'box';
  if (u === 'litre' || u === 'liter' || u === 'ltr' || u === 'l') return 'ltr';
  return u;
};

const PosScreen = () => {
  const { showSuccess, showError, showWarning } = useToast();

  // Master Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active Billing Ticket State
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);
  const [discountAmount, setDiscountAmount] = useState('0.00');
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'UPI', 'CARD'
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [mobileTab, setMobileTab] = useState('products'); // 'products' or 'bill' for mobile resolution

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Custom Item Form State
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemQty, setCustomItemQty] = useState('1');

  const searchInputRef = useRef(null);

  const generateInvoiceNumber = useCallback((settings) => {
    const prefix = settings?.invoicePrefix || 'BAKE';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = String(Math.floor(1000 + Math.random() * 9000));
    setInvoiceNumber(`${prefix}-${dateStr}-${randSeq}`);
  }, []);

  // Fetch initial master catalog and settings
  const fetchMasterData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, custRes, setRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/categories'),
        api.get('/customers'),
        api.get('/settings'),
      ]);

      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data || []);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data || []);
      if (setRes.status === 'fulfilled') {
        setShopSettings(setRes.value.data);
        generateInvoiceNumber(setRes.value.data);
      } else {
        generateInvoiceNumber(null);
      }
    } catch (err) {
      console.error('Failed to load POS master data', err);
      showError('Unable to connect to backend service. Please verify server status.');
    } finally {
      setLoading(false);
    }
  }, [generateInvoiceNumber, showError]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Fast Cart Quantity Map
  const cartItemMap = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      if (item.productId) {
        map.set(item.productId, (map.get(item.productId) || 0) + Number(item.quantity));
      }
    });
    return map;
  }, [cartItems]);

  // Click outside to close customer dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Customers for Search Combobox
  const filteredCustomers = useMemo(() => {
    const term = customerSearchTerm.trim().toLowerCase();
    if (!term) {
      return customers;
    }
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(term))
    );
  }, [customers, customerSearchTerm]);

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategoryId === 'ALL' ||
        String(p.category?.id || p.categoryId) === String(selectedCategoryId);
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Add product to cart with stock validation
  const handleAddToCart = (product, qtyToAdd = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);
    const unitPrice = Number(product.sellingPrice ?? product.price ?? 0);
    const taxRate = Number(product.taxRate ?? shopSettings?.defaultTaxRate ?? 5.0);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = Number(updated[existingIndex].quantity) + Number(qtyToAdd);

      if (newQty > product.stockQuantity) {
        showWarning(`Stock limit: only ${product.stockQuantity} ${product.unit} available for ${product.name}`);
        return;
      }

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
      };
      setCartItems(updated);
    } else {
      if (product.stockQuantity <= 0) {
        showWarning(`${product.name} is currently out of stock`);
        return;
      }

      const newItem = {
        id: `cart-${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        sku: product.sku || `ITEM-${product.id}`,
        unit: product.unit || 'pcs',
        price: unitPrice,
        taxRate: taxRate,
        quantity: Number(qtyToAdd),
        stockQuantity: product.stockQuantity,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
    showSuccess(`Added ${product.name}`);
  };

  // Update quantity directly
  const handleUpdateQuantity = (index, newQty) => {
    const num = Number(newQty);
    if (isNaN(num) || num <= 0) {
      handleRemoveItem(index);
      return;
    }

    const item = cartItems[index];
    if (item.productId && item.stockQuantity && num > item.stockQuantity) {
      showWarning(`Stock limit reached! Max available: ${item.stockQuantity} ${item.unit}`);
      return;
    }

    const updated = [...cartItems];
    updated[index] = { ...updated[index], quantity: num };
    setCartItems(updated);
  };

  // Remove single line item
  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount('0.00');
    setPaymentMethod('CASH');
    setSelectedCustomerId('');
    setSelectedCustomer(null);
    setCustomerSearchTerm('');
    setIsCustomerDropdownOpen(false);
    generateInvoiceNumber(shopSettings);
    showSuccess('Cleared active ticket');
  };

  // Add custom unlisted bakery item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    const name = customItemName.trim();
    const price = Number(customItemPrice);
    const qty = Number(customItemQty) || 1;

    if (!name || isNaN(price) || price < 0) {
      showWarning('Valid item name and price are required');
      return;
    }

    const customLine = {
      id: `custom-${Date.now()}`,
      productId: products[0]?.id || null,
      name: name,
      imageUrl: null,
      sku: 'CUSTOM',
      unit: 'pcs',
      price: price,
      taxRate: Number(shopSettings?.defaultTaxRate || 5.0),
      quantity: qty,
      stockQuantity: 9999,
    };

    setCartItems((prev) => [...prev, customLine]);
    setShowCustomItemModal(false);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty('1');
    showSuccess(`Added custom item: ${name}`);
  };

  // Select customer
  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    const found = customers.find((c) => String(c.id) === String(customerId));
    setSelectedCustomer(found || null);
    if (found) {
      setCustomerSearchTerm(`${found.name} (${found.phone || 'No phone'})`);
    } else {
      setCustomerSearchTerm('');
    }
    setIsCustomerDropdownOpen(false);
  };

  const handleSelectCustomerRecord = (cust) => {
    if (!cust) {
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCustomerSearchTerm('');
    } else {
      setSelectedCustomerId(String(cust.id));
      setSelectedCustomer(cust);
      setCustomerSearchTerm(`${cust.name} (${cust.phone || 'No phone'})`);
    }
    setIsCustomerDropdownOpen(false);
  };

  // Quick Customer Creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showWarning('Customer name and phone number are required');
      return;
    }

    setSavingCustomer(true);
    try {
      const resp = await api.post('/customers', {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        email: '',
        address: '',
      });
      const created = resp.data;
      setCustomers((prev) => [created, ...prev]);
      setSelectedCustomerId(String(created.id));
      setSelectedCustomer(created);
      setCustomerSearchTerm(`${created.name} (${created.phone || 'No phone'})`);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      showSuccess(`Created customer ${created.name}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create customer record');
    } finally {
      setSavingCustomer(false);
    }
  };

  // Financial Calculations
  const calculations = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    cartItems.forEach((item) => {
      const lineTotal = Number(item.price) * Number(item.quantity);
      const lineTax = lineTotal * ((Number(item.taxRate) || 0) / 100);
      subtotal += lineTotal;
      taxTotal += lineTax;
    });

    let discount = 0;
    const inputVal = Number(discountAmount) || 0;
    if (discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, inputVal));
      discount = (subtotal * pct) / 100;
    } else {
      discount = Math.min(subtotal, Math.max(0, inputVal));
    }

    const grandTotal = Math.max(0, subtotal - discount + taxTotal);
    const totalUnits = cartItems.reduce((acc, item) => acc + Number(item.quantity), 0);

    return {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      itemCount: cartItems.length,
      totalUnits: Number(totalUnits.toFixed(3)),
    };
  }, [cartItems, discountAmount, discountType]);

  // Checkout & Submit Order to Backend
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      showWarning('Cannot checkout an empty ticket. Add items first.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
        paymentMethod: paymentMethod,
        discountAmount: Number(calculations.discount),
        notes: `POS Terminal Sale (${cartItems.length} lines)`,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price),
        })),
      };

      const response = await api.post('/orders', orderPayload);
      const savedOrder = response.data;

      setCompletedOrder(savedOrder);
      showSuccess(`Order completed! Invoice #${savedOrder.invoiceNumber}`);

      // Reset ticket state for next customer
      setCartItems([]);
      setDiscountAmount('0.00');
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      generateInvoiceNumber(shopSettings);

      // Refresh product stock
      api.get('/products').then((res) => setProducts(res.data || [])).catch(() => {});
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Transaction failed. Please check stock limits.';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [cartItems, selectedCustomerId, paymentMethod, calculations.discount, shopSettings, generateInvoiceNumber, showSuccess, showError, showWarning]);

  // Keyboard shortcut listener (Ctrl+/ for search, F4 for checkout)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        if (cartItems.length > 0 && !submitting) {
          handleCheckout();
        }
      } else if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, submitting, handleCheckout]);

  // Preview Bill Modal Generator
  const handlePreviewBill = () => {
    if (cartItems.length === 0) return;

    const mockOrder = {
      invoiceNumber: invoiceNumber,
      createdAt: new Date().toISOString(),
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      customerPhone: selectedCustomer?.phone || '',
      paymentMethod: paymentMethod,
      paymentStatus: 'UNPAID',
      subtotalAmount: Number(calculations.subtotal),
      taxAmount: Number(calculations.taxTotal),
      discountAmount: Number(calculations.discount),
      totalAmount: Number(calculations.grandTotal),
      items: cartItems.map((item) => ({
        id: item.id,
        productName: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.price),
        taxRate: Number(item.taxRate),
        totalPrice: Number(item.price) * Number(item.quantity),
      })),
    };

    setPreviewOrder(mockOrder);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans select-none overflow-hidden transition-colors duration-150">
      {/* Mobile Top Navigation Tabs (< md screens) */}
      <div className="md:hidden flex items-center bg-slate-950 text-white p-1.5 shrink-0 border-b-2 border-slate-900 gap-1.5 z-20 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileTab === 'products'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4 stroke-[2.5]" />
          <span>Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('bill')}
          className={`flex-1 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileTab === 'bill'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 stroke-[2.5]" />
          <span>Bill ({cartItems.length} • ₹{calculations.grandTotal})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LEFT COLUMN: Product Catalog & Quick Finder                               */}
      {/* Visible on Mobile when mobileTab === 'products', Always visible on Desktop*/}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 dark:bg-[#0f1422] transition-colors duration-150 pb-16 md:pb-0 ${
        mobileTab === 'products' ? 'flex' : 'hidden md:flex'
      }`}>
        {/* Top Control Bar: Search & Quick Custom Item (Perfect Aligned Height) */}
        <div className="p-2.5 sm:p-3 border-b-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#111622] flex items-center space-x-2 shrink-0 transition-colors duration-150">
          <div className="relative flex-1">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-300 stroke-[2.5]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU... (Ctrl + /)"
              className="w-full h-9 pl-9 sm:pl-10 pr-8 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-950 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 hover:text-black dark:hover:text-white p-0.5 cursor-pointer uppercase"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Custom Item Button */}
          <button
            type="button"
            onClick={() => setShowCustomItemModal(true)}
            className="h-9 px-3 bg-white dark:bg-[#161d2d] hover:bg-slate-100 dark:hover:bg-[#1e2638] border-2 border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 rounded-xl font-black text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Add a custom item with custom price"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950 dark:text-slate-200 stroke-[3]" />
            <span className="hidden sm:inline">Custom</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchMasterData}
            title="Refresh Products & Prices"
            className="h-9 w-9 bg-white dark:bg-[#161d2d] hover:bg-slate-100 dark:hover:bg-[#1e2638] border-2 border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${loading ? 'animate-spin text-slate-950 dark:text-white' : ''}`} />
          </button>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="px-2.5 py-1.5 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs transition-colors duration-150">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer border-2 ${
              selectedCategoryId === 'ALL'
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-2xs'
                : 'bg-white dark:bg-[#161d2d] text-slate-950 dark:text-slate-200 border-slate-900 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1e2638]'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer border-2 ${
                String(selectedCategoryId) === String(cat.id)
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-[#161d2d] text-slate-950 dark:text-slate-200 border-slate-900 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1e2638]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid - BALANCED & RESPONSIVE */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-900 dark:text-white" />
              <p className="text-xs font-bold">Loading bakery catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Package className="w-9 h-9 stroke-1" />
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                No products found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('ALL');
                }}
                className="text-xs text-slate-900 dark:text-white font-bold hover:underline cursor-pointer"
              >
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map((p) => {
                const inCartQty = cartItemMap.get(p.id) || 0;
                const isOutOfStock = p.stockQuantity <= 0;
                const price = Number(p.sellingPrice ?? p.price ?? 0);

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && handleAddToCart(p, 1)}
                    className={`group rounded-xl border-2 transition-all duration-150 flex flex-col justify-between select-none overflow-hidden min-h-[154px] sm:min-h-[160px] ${
                      isOutOfStock
                        ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800'
                        : inCartQty > 0
                        ? 'cursor-pointer bg-white dark:bg-[#141a29] border-slate-950 dark:border-white shadow-sm ring-2 ring-slate-950 dark:ring-white'
                        : 'cursor-pointer bg-white dark:bg-[#141a29] border-slate-900 dark:border-slate-700 hover:border-black dark:hover:border-white hover:shadow-xs'
                    }`}
                  >
                    {/* Product Image Header */}
                    <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border-b-2 border-slate-900 dark:border-slate-700">
                      <ProductImage product={p} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />

                      {/* Category Tag Badge */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/95 dark:bg-slate-900/95 text-[9px] font-black uppercase text-slate-950 dark:text-white shadow-2xs border border-slate-900 dark:border-slate-700 leading-none backdrop-blur-xs">
                        {p.category?.name || 'Bakery'}
                      </span>

                      {/* In Cart Indicator */}
                      {inCartQty > 0 && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-[9px] shadow-xs flex items-center space-x-0.5 border border-slate-950 dark:border-white leading-none">
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          <span>{inCartQty}</span>
                        </span>
                      )}
                    </div>

                    {/* Card Content: Title, Price & Stock */}
                    <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                      <h3
                        className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm leading-snug line-clamp-1 flex items-center"
                        title={p.name}
                      >
                        {p.name}
                      </h3>

                      <div className="pt-1.5 mt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                        {/* Price & Unit */}
                        <div className="flex items-baseline space-x-0.5 min-w-0">
                          <span className="text-xs sm:text-sm font-black font-mono text-slate-950 dark:text-white leading-none">
                            ₹{price.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none">
                            /{formatUnit(p.unit)}
                          </span>
                        </div>

                        {/* Stock Badge */}
                        <div className="shrink-0">
                          {isOutOfStock ? (
                            <span className="text-[9px] font-extrabold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-600 dark:border-rose-400 px-1.5 py-0.5 rounded uppercase leading-none block">
                              Out
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase leading-none block whitespace-nowrap ${
                                p.stockQuantity <= 5
                                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-800 dark:border-amber-700'
                                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-800 dark:border-emerald-700'
                              }`}
                            >
                              {p.stockQuantity} {formatUnit(p.unit)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Floating Quick-Bill Bar (Shows on mobile when cart has items) */}
        {cartItems.length > 0 && (
          <div className="md:hidden px-3.5 py-2.5 bg-slate-950 text-white flex items-center justify-between border-t-2 border-slate-900 shrink-0 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow-xs">
                {cartItems.length}
              </span>
              <span className="text-xs font-bold text-slate-300">Total:</span>
              <span className="font-mono font-black text-sm text-white">₹{calculations.grandTotal}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileTab('bill')}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              <span>Review Bill</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Active Billing Ticket (Balanced Desktop Width ~45%-48%)     */}
      {/* Visible on Mobile when mobileTab === 'bill', Always visible on Desktop    */}
      {/* ========================================================================= */}
      <div className={`w-full md:w-[46%] lg:w-[45%] xl:w-[44%] 2xl:w-[42%] md:min-w-[450px] md:max-w-[580px] shrink-0 h-full flex flex-col bg-white dark:bg-[#111622] shadow-sm z-10 overflow-hidden transition-colors duration-150 border-l-2 border-slate-900 dark:border-slate-800 pb-16 md:pb-0 ${
        mobileTab === 'bill' ? 'flex' : 'hidden md:flex'
      }`}>
        {/* Ticket Top Header - Compact Heading */}
        <div className="py-1.5 px-2.5 sm:px-3 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#141a29] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center border-2 border-slate-900 dark:border-white shadow-2xs shrink-0">
              <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h2 className="font-black text-xs sm:text-sm uppercase tracking-wide text-slate-950 dark:text-white leading-tight truncate">
                  Current Bill
                </h2>
                <span className="font-mono text-[9px] text-slate-950 dark:text-white bg-slate-200 dark:bg-slate-800 px-1 py-0.2 rounded font-black border border-slate-400 dark:border-slate-700 whitespace-nowrap">
                  {invoiceNumber}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block leading-tight truncate">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • {calculations.totalUnits} units total
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewCustName('');
                setNewCustPhone('');
                setShowAddCustomerModal(true);
              }}
              className="px-2 py-1 text-[11px] font-black text-slate-950 dark:text-white bg-white dark:bg-[#161d2d] hover:bg-slate-100 dark:hover:bg-slate-800 border-[1.5px] border-slate-900 dark:border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 uppercase shadow-2xs"
              title="Register new customer name & phone number"
            >
              <UserPlus className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">+ Customer</span>
              <span className="sm:hidden">+ Cust</span>
            </button>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="px-2 py-1 text-[11px] font-black text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-[1.5px] border-rose-700 dark:border-rose-400 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 uppercase"
                title="Clear all items from ticket"
              >
                <Trash2 className="w-3 h-3 stroke-[2.5]" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Search & Selector Bar (Type Name / Phone Number) */}
        <div className="py-1 px-2.5 sm:px-3 border-b-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#111622] relative shrink-0" ref={customerDropdownRef}>
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-950 dark:text-slate-300 stroke-[2.5] pointer-events-none" />
            <input
              type="text"
              value={customerSearchTerm}
              onChange={(e) => {
                setCustomerSearchTerm(e.target.value);
                if (!isCustomerDropdownOpen) setIsCustomerDropdownOpen(true);
                if (selectedCustomerId && e.target.value !== `${selectedCustomer?.name} (${selectedCustomer?.phone || 'No phone'})`) {
                  setSelectedCustomerId('');
                  setSelectedCustomer(null);
                }
              }}
              onFocus={() => setIsCustomerDropdownOpen(true)}
              placeholder="Search customer name or phone... (Walk-in)"
              className="w-full pl-8 pr-7 py-1 bg-slate-50 dark:bg-[#161d2d] border-[1.5px] border-slate-900 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-950 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white cursor-text"
            />

            {/* Clear / Reset to Walk-in button */}
            {(customerSearchTerm || selectedCustomer) && (
              <button
                type="button"
                onClick={() => handleSelectCustomerRecord(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-950 dark:hover:text-white p-0.5 rounded cursor-pointer"
                title="Reset to Walk-in Customer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {isCustomerDropdownOpen && (
            <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-white dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-100">
              {/* Option: Walk-in General Counter */}
              <div
                onClick={() => handleSelectCustomerRecord(null)}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                  !selectedCustomerId ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
                  <span className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white">
                    Walk-in Customer (General Counter)
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Default</span>
              </div>

              {/* Filtered Existing Customers */}
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const isSelected = String(cust.id) === String(selectedCustomerId);
                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomerRecord(cust)}
                      className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800 last:border-b-0 ${
                        isSelected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-black text-xs sm:text-sm text-slate-950 dark:text-white truncate">
                          {cust.name}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                          {cust.phone || 'No phone'}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              ) : customerSearchTerm.trim() ? (
                <div className="p-3 text-center">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    No existing customer found for "{customerSearchTerm}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (/^\d+$/.test(customerSearchTerm.trim())) {
                        setNewCustPhone(customerSearchTerm.trim());
                        setNewCustName('');
                      } else {
                        setNewCustName(customerSearchTerm.trim());
                        setNewCustPhone('');
                      }
                      setShowAddCustomerModal(true);
                      setIsCustomerDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer border-2 border-slate-950 dark:border-white shadow-xs inline-flex items-center space-x-1"
                  >
                    <UserPlus className="w-3 h-3 stroke-[2.5]" />
                    <span>+ Add "{customerSearchTerm}" as Customer</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Active Ticket Items List - COMPACT & HIGH VISIBILITY */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 bg-slate-100/60 dark:bg-[#0d121d]">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
              <div>
                <p className="font-black text-slate-950 dark:text-slate-200 text-xs sm:text-sm">Current Bill is Empty</p>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-bold max-w-sm mt-0.5">
                  Search or click any product on the left catalog to add it to this bill.
                </p>
              </div>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const lineTotal = Number(item.price) * Number(item.quantity);

              return (
                <div
                  key={item.id}
                  className="py-2 px-2.5 sm:px-3.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#161d2d] flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all"
                >
                  {/* Left: S.No, Product Thumbnail & Name & Unit Price on mobile */}
                  <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 flex-1">
                    <span className="w-6 sm:w-7 text-center font-mono font-black text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg border border-slate-900 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <ProductImage
                        product={{ id: item.productId, imageUrl: item.imageUrl, name: item.name }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white leading-tight truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 leading-none">
                          {item.sku || 'ITEM'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap sm:hidden leading-none">
                          ₹{Number(item.price).toFixed(2)}/{formatUnit(item.unit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unit Price Column (Cleanly visible on tablet & desktop) */}
                  <div className="w-24 text-right pr-4 hidden sm:block shrink-0">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      ₹{Number(item.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">
                      /{formatUnit(item.unit)}
                    </span>
                  </div>

                  {/* Middle: Stepper Controls */}
                  <div className="w-24 flex items-center justify-center space-x-0.5 sm:space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(index, Number(item.quantity) - 1)}
                      className="w-6.5 h-6.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 border border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 flex items-center justify-center font-black text-xs transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>

                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                      className="w-9 h-6.5 text-center bg-slate-50 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-950 dark:text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(index, Number(item.quantity) + 1)}
                      className="w-6.5 h-6.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 border border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 flex items-center justify-center font-black text-xs transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Right: Line Total & Trash */}
                  <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 text-right">
                    <div className="w-18 text-right">
                      <span className="font-mono font-black text-xs sm:text-sm text-slate-950 dark:text-white whitespace-nowrap">
                        ₹{lineTotal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Remove item from bill"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ticket Financial Summary & Checkout Footer */}
        <div className="p-2 sm:p-2.5 border-t-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#141a29] space-y-1.5 shrink-0 transition-colors duration-150 shadow-md">
          {/* Subtotal, Tax & Discount Box */}
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#161d2d] border border-slate-300 dark:border-slate-700 space-y-0.5 text-[11px]">
            {/* Subtotal Row */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 leading-tight">
              <span className="font-semibold text-[11px]">Subtotal ({cartItems.length} items • {calculations.totalUnits} units)</span>
              <span className="font-mono font-black text-slate-950 dark:text-white whitespace-nowrap text-xs">₹{calculations.subtotal}</span>
            </div>

            {/* GST Row */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 leading-tight">
              <span className="font-semibold text-[11px]">GST ({shopSettings?.defaultTaxRate || '5'}%)</span>
              <span className="font-mono font-black text-slate-950 dark:text-white whitespace-nowrap text-xs">+₹{calculations.taxTotal}</span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/80 leading-tight">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-[11px]">Discount:</span>
                <button
                  type="button"
                  onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')}
                  className="text-[9px] px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-900 dark:border-slate-600 rounded font-black text-slate-950 dark:text-slate-200 cursor-pointer uppercase shrink-0"
                  title="Toggle discount between Rupees (₹) and Percentage (%)"
                >
                  {discountType === 'fixed' ? '₹' : '%'}
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-12 px-1 py-0 bg-white dark:bg-[#111622] border border-slate-900 dark:border-slate-700 rounded text-right font-mono font-bold text-[11px] text-slate-950 dark:text-white focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <span className="font-mono font-black text-rose-700 dark:text-rose-400 shrink-0 whitespace-nowrap text-xs">
                -₹{calculations.discount}
              </span>
            </div>
          </div>

          {/* Grand Total Banner - PRESERVED WITH NO CHANGE */}
          <div className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl bg-slate-950 text-white dark:bg-black border-2 border-slate-900 dark:border-slate-700 flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 leading-none">
                Total Payable
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">Incl. taxes & discounts</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white leading-none">
              ₹{calculations.grandTotal}
            </div>
          </div>

          {/* Payment Method Pills */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider shrink-0 hidden sm:inline">
              Payment:
            </span>
            <div className="grid grid-cols-3 gap-1 flex-1">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id)}
                    className={`py-1 px-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-[#161d2d] border-slate-900/60 dark:border-slate-700 text-slate-950 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3 stroke-[2.5]" />
                    <span className="leading-none">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button: CHARGE & PRINT BILL */}
          <button
            type="button"
            disabled={submitting || cartItems.length === 0}
            onClick={handleCheckout}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm border-2 border-slate-950 dark:border-white flex items-center justify-center space-x-1.5 transition-all active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Bill...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>CHARGE & PRINT BILL (F4)</span>
              </>
            )}
          </button>

          {/* Secondary Actions & Shortcuts */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={handlePreviewBill}
              className="text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white font-bold flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
            >
              <Eye className="w-3 h-3 stroke-[2.5]" />
              <span>Preview Receipt</span>
            </button>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Shortcuts: <span className="font-mono font-black text-slate-950 dark:text-slate-200">F4</span> (Pay), <span className="font-mono font-black text-slate-950 dark:text-slate-200">Ctrl + /</span> (Search)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* 1. Add New Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141a29] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-950 dark:text-white animate-in fade-in">
            <div className="p-4 sm:p-5 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#111622]">
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-5 h-5 text-slate-950 dark:text-slate-200 stroke-[2.5]" />
                <h3 className="font-black text-base sm:text-lg uppercase tracking-wide">Register New Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-700 hover:text-black dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black uppercase text-xs text-slate-950 dark:text-slate-200 mb-1.5 tracking-wider">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-xs text-slate-950 dark:text-slate-200 mb-1.5 tracking-wider">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm sm:text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t-2 border-slate-900 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border-2 border-slate-900 dark:border-slate-700 rounded-xl font-black text-slate-950 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs cursor-pointer border-2 border-slate-950 dark:border-white disabled:opacity-50"
                >
                  {savingCustomer ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Custom Item Quick Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141a29] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-slate-950 dark:text-white animate-in fade-in">
            <div className="p-4 sm:p-5 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#111622]">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-slate-950 dark:text-slate-200 stroke-[3]" />
                <h3 className="font-black text-base sm:text-lg uppercase tracking-wide">Add Custom Item</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="text-slate-700 hover:text-black dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black uppercase text-xs text-slate-950 dark:text-slate-200 mb-1.5 tracking-wider">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. Custom Birthday Cake Deco"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black uppercase text-xs text-slate-950 dark:text-slate-200 mb-1.5 tracking-wider">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    placeholder="250.00"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm sm:text-base font-mono font-black focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-xs text-slate-950 dark:text-slate-200 mb-1.5 tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#161d2d] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-sm sm:text-base font-mono font-black focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t-2 border-slate-900 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="px-4 py-2 border-2 border-slate-900 dark:border-slate-700 rounded-xl font-black text-slate-950 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs cursor-pointer border-2 border-slate-950 dark:border-white"
                >
                  Add to Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Invoice Print Modal (Receipt / A4 Format) */}
      {(completedOrder || previewOrder) && (
        <InvoicePrintModal
          order={completedOrder || previewOrder}
          shopSettings={shopSettings}
          onClose={() => {
            setCompletedOrder(null);
            setPreviewOrder(null);
          }}
        />
      )}

      {/* 4. View All Items Modal */}
      <ViewAllItemsModal
        isOpen={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
        cartItems={cartItems}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveItem={handleRemoveItem}
        handleClearCart={() => {
          handleClearCart();
          setShowViewAllModal(false);
        }}
      />
    </div>
  );
};

export default PosScreen;
