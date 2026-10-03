import React, { useState, useMemo } from 'react';
import { Search, X, Package, Plus } from 'lucide-react';

const ProductPickerModal = ({ isOpen, onClose, products, categories, onSelectProduct, cartItemMap }) => {
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCatId === 'ALL' || String(p.category?.id || p.categoryId) === String(selectedCatId);
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [products, selectedCatId, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white border-2 border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 font-sans">
        {/* Title Bar */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">Select Item from Catalog</span>
            <span className="text-xs text-slate-300 font-mono">({products.length} products available)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-300 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Product Name, SKU code, or Barcode..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-400 rounded focus:outline-none focus:border-slate-800 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-black font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCatId('ALL')}
              className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                selectedCatId === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                  String(selectedCatId) === String(cat.id)
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items Table View */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching products found for "{search}"
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-800 border-b border-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-2 px-3 border-r border-slate-300">SKU / Code</th>
                  <th className="py-2 px-3 border-r border-slate-300">Product Name</th>
                  <th className="py-2 px-3 border-r border-slate-300">Category</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-right">Price</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Stock</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((p) => {
                  const inCartQty = cartItemMap?.get(p.id) || 0;
                  const isOutOfStock = p.stockQuantity <= 0;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => !isOutOfStock && onSelectProduct(p)}
                      className={`hover:bg-amber-50 cursor-pointer transition-colors ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold text-slate-700 border-r border-slate-200">
                        {p.sku || `ITEM-${p.id}`}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">
                        {p.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                        {p.category?.name || 'Standard'}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 text-right border-r border-slate-200">
                        ₹{Number(p.sellingPrice || p.price || 0).toFixed(2)}
                        <span className="text-[10px] text-slate-500 font-sans ml-1 font-semibold">/{p.unit || 'pc'}</span>
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stockQuantity <= 5
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} {p.unit || 'pcs'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(p);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] flex items-center justify-center space-x-1 mx-auto disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                          {inCartQty > 0 && (
                            <span className="ml-1 px-1 bg-amber-400 text-slate-950 rounded-full font-black text-[9px]">
                              {inCartQty}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <span>Click any product row to add it directly to the invoice.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-400 hover:bg-slate-200 rounded font-bold text-slate-800 cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;