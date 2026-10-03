import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  RefreshCw,
  X,
  LayoutGrid,
  List
} from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('table');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Product form
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    categoryId: '',
    sellingPrice: '',
    costPrice: '',
    taxRate: '5.00',
    stockQuantity: '10',
    lowStockThreshold: '3',
    unit: 'Piece',
    imageUrl: '',
    active: true,
  });

  const { showSuccess, showError, showWarning } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.allSettled([
        api.get('/products/all'),
        api.get('/categories/all'),
      ]);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
      if (cRes.status === 'fulfilled') setCategories(cRes.value.data);
    } catch (err) {
      console.error('Failed to fetch product data', err);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      description: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: '',
      categoryId: categories[0]?.id || '',
      sellingPrice: '',
      costPrice: '',
      taxRate: '5.00',
      stockQuantity: '10',
      lowStockThreshold: '3',
      unit: 'Piece',
      imageUrl: '',
      active: true,
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProdForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      taxRate: product.taxRate,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      unit: product.unit,
      imageUrl: product.imageUrl || '',
      active: product.active,
    });
    setShowProductModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSavingCategory(true);
    try {
      await api.post('/categories', { name: catName.trim(), description: catDesc.trim() });
      setCatName('');
      setCatDesc('');
      setShowCategoryModal(false);
      showSuccess('Bakery category created successfully!');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.categoryId || !prodForm.sellingPrice) {
      showWarning('Please fill all required fields marked *');
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, prodForm);
        showSuccess(`Product "${prodForm.name}" updated successfully!`);
      } else {
        await api.post('/products', prodForm);
        showSuccess(`New product "${prodForm.name}" added!`);
      }
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivatingId) return;
    try {
      await api.delete(`/products/${deactivatingId}`);
      showSuccess('Product deactivated successfully');
      setDeactivatingId(null);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate product');
      setDeactivatingId(null);
    }
  };

  const handleReactivate = async (product) => {
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.categoryId,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice,
        taxRate: product.taxRate,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        unit: product.unit,
        imageUrl: product.imageUrl || '',
        active: true,
      });
      showSuccess(`Product "${product.name}" restored successfully!`);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to restore product');
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory ? p.categoryId === Number(selectedCategory) : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>Product Catalog & Categories</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
            Manage bakery catalog items, recipes, selling prices, and stock limits
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-y-2">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-2 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#171c2b] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Tag className="w-4 h-4 text-amber-500" />
            <span>+ Category</span>
          </button>

          <button
            type="button"
            onClick={openNewProductModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black border-2 border-slate-900 shadow-2xs flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Bakery Item</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            title="Refresh Products"
            className="p-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shadow-xs transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or barcode..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-slate-50 dark:bg-[#171c2b] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-100 dark:bg-[#171c2b] p-0.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm font-bold">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm font-bold">No products found.</div>
          ) : (
            filtered.map((p, pIdx) => {
              const isLow = p.stockQuantity <= p.lowStockThreshold;

              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-amber-500 transition-colors shadow-xs"
                >
                  <div>
                    <div className="h-36 rounded-xl bg-slate-100 dark:bg-[#0c0e15] overflow-hidden mb-3 border-2 border-slate-900/20 dark:border-slate-700 relative">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded-md bg-slate-900/90 text-white border border-slate-700 shadow-xs font-mono">
                        #{pIdx + 1}
                      </span>
                      <span className="absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 border border-slate-900 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xs">
                        {p.categoryName}
                      </span>
                      {isLow && (
                        <span className="absolute bottom-2 left-2 text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock: {p.stockQuantity} {p.unit}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{p.sku}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                          ₹{Number(p.sellingPrice).toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                          /{p.unit}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                        Cost: ₹{Number(p.costPrice).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditProductModal(p)}
                        className="px-2.5 py-1.5 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 dark:text-amber-200 font-black text-xs inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Edit product details"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Edit</span>
                      </button>

                      {p.active ? (
                        <button
                          type="button"
                          onClick={() => setDeactivatingId(p.id)}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-500 hover:text-white text-rose-800 dark:text-rose-200 font-black text-xs inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Deactivate product"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReactivate(p)}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-500 hover:text-white text-emerald-800 dark:text-emerald-200 font-black text-xs inline-flex items-center gap-1 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Reactivate product"
                        >
                          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Restore</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121622] border-2 border-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-[#171c2b] text-slate-900 dark:text-slate-200 uppercase text-xs font-black border-b-2 border-slate-900 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-3 text-center w-14 font-black">#</th>
                  <th className="py-3.5 px-4 font-black">Product</th>
                  <th className="py-3.5 px-4 font-black">SKU / Code</th>
                  <th className="py-3.5 px-4 font-black">Category</th>
                  <th className="py-3.5 px-4 font-black text-right">Selling Price</th>
                  <th className="py-3.5 px-4 font-black text-right">Cost Price</th>
                  <th className="py-3.5 px-4 font-black text-center">Available Stock</th>
                  <th className="py-3.5 px-4 font-black text-center">Status</th>
                  <th className="py-3.5 px-4 font-black text-center sticky right-0 bg-slate-100 dark:bg-[#171c2b] border-l-2 border-slate-900/20 dark:border-slate-800 z-20 min-w-[150px] shadow-[-6px_0_12px_rgba(0,0,0,0.08)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-700/80">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-400 font-bold">
                      Loading products...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-400 font-bold">
                      No products found matching filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product, index) => {
                    const isLow = product.stockQuantity <= product.lowStockThreshold;

                    return (
                      <tr key={product.id} className="group hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors border-b-2 border-slate-200 dark:border-slate-800">
                        {/* S.No / Serial Number */}
                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </td>

                        {/* Product Name & Image */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {product.barcode || product.unit}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 text-xs font-bold whitespace-nowrap">
                          {product.sku}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#1a2030] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                            {product.categoryName}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="font-black text-amber-600 dark:text-amber-400 font-mono text-base">
                            ₹{Number(product.sellingPrice).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold font-sans">
                            per {product.unit}
                          </div>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-mono text-xs font-bold whitespace-nowrap">
                          ₹{Number(product.costPrice).toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                              isLow
                                ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 border-2 border-amber-500'
                                : 'bg-slate-100 dark:bg-[#1a2030] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                            <span>
                              {product.stockQuantity} {product.unit}
                            </span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                              product.active
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                            }`}
                          >
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Sticky Actions Column */}
                        <td className="py-3 px-4 text-center sticky right-0 bg-white dark:bg-[#121622] group-hover:bg-amber-50 dark:group-hover:bg-[#161d2d] border-l-2 border-b-2 border-slate-900/20 dark:border-slate-800 z-10 min-w-[150px] shadow-[-6px_0_12px_rgba(0,0,0,0.08)] whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(product)}
                              className="px-2.5 py-1.5 rounded-lg border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 dark:text-amber-200 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                              title="Edit product details"
                            >
                              <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Edit</span>
                            </button>

                            {product.active ? (
                              <button
                                type="button"
                                onClick={() => setDeactivatingId(product.id)}
                                className="px-2.5 py-1.5 rounded-lg border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-500 hover:text-white text-rose-800 dark:text-rose-200 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Deactivate product"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Delete</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReactivate(product)}
                                className="px-2.5 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-500 hover:text-white text-emerald-800 dark:text-emerald-200 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Reactivate product"
                              >
                                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Restore</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl my-6 animate-in fade-in transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {editingProduct ? 'Edit Bakery Product' : 'Add New Bakery Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="e.g. Chocolate Truffle Cake"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    required
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.sellingPrice}
                    onChange={(e) => setProdForm({ ...prodForm, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-amber-600 dark:text-amber-400 font-black font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.costPrice}
                    onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GST Tax (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.taxRate}
                    onChange={(e) => setProdForm({ ...prodForm, taxRate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.stockQuantity}
                    onChange={(e) => setProdForm({ ...prodForm, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Low Stock Limit *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.lowStockThreshold}
                    onChange={(e) => setProdForm({ ...prodForm, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure *</label>
                  <select
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="Piece">Piece</option>
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={prodForm.imageUrl}
                    onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 w-full max-w-md shadow-2xl transition-colors">
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-3 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-amber-500" />
              <span>Create New Category</span>
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Sourdough Breads"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category description..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a2030] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {savingCategory ? 'Creating...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Deactivate Confirmation */}
      {deactivatingId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141926] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl transition-colors">
            <h3 className="font-black text-slate-900 dark:text-white text-base mb-2">Deactivate Product</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Are you sure? It will no longer appear on the cashier counter billing screen.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeactivatingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
