import React from 'react';
import { X, Trash2, Plus, Minus, Receipt, ShoppingBag } from 'lucide-react';
import ProductImage from './ProductImage';

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

const ViewAllItemsModal = ({
  isOpen,
  onClose,
  cartItems,
  handleUpdateQuantity,
  handleRemoveItem,
  handleClearCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#111622] rounded-2xl border-2 border-slate-900 dark:border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#161d2d] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center border-2 border-slate-900 dark:border-white shadow-sm">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-950 dark:text-white leading-tight">
                All Selected Items
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in ticket
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleClearCart();
                  onClose();
                }}
                className="px-3 py-2 text-xs sm:text-sm font-black text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-2 border-rose-700 dark:border-rose-400 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 sm:space-x-2 uppercase"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-2 border-transparent hover:border-slate-900 dark:hover:border-slate-700"
              aria-label="Close"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Body (Scrollable List) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-[#111622]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <Receipt className="w-10 h-10 stroke-[2]" />
              </div>
              <p className="font-black text-lg text-slate-900 dark:text-white">Ticket is empty</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
                You haven't added any items yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const lineTotal = Number(item.price) * Number(item.quantity);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#161d2d] shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    {/* Product Info */}
                    <div className="flex items-center space-x-4 min-w-0 flex-1 w-full sm:w-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-slate-900 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <ProductImage
                          product={{ id: item.productId, imageUrl: item.imageUrl, name: item.name }}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-base sm:text-lg text-slate-950 dark:text-white leading-tight">
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-xs sm:text-sm font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border-2 border-slate-200 dark:border-slate-700">
                            {item.sku || 'ITEM'}
                          </span>
                          <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-slate-200">
                            ₹{Number(item.price).toFixed(2)}
                            <span className="text-xs text-slate-500 font-bold ml-1">/{formatUnit(item.unit)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Total */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t-2 border-slate-100 dark:border-slate-800 sm:border-0">
                      {/* Stepper */}
                      <div className="flex items-center space-x-1 sm:space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, Number(item.quantity) - 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                          className="w-14 sm:w-16 h-9 sm:h-10 text-center bg-slate-50 dark:bg-[#111622] border-2 border-slate-900 dark:border-slate-700 rounded-lg text-sm sm:text-base font-mono font-black text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(index, Number(item.quantity) + 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-700 text-slate-950 dark:text-slate-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[80px] sm:min-w-[100px]">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total</span>
                        <span className="font-mono font-black text-lg sm:text-xl text-slate-950 dark:text-white">
                          ₹{lineTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Trash */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 sm:p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 border-2 border-transparent hover:border-rose-600 dark:hover:border-rose-400 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#161d2d] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-md hover:bg-black dark:hover:bg-slate-200 border-2 border-slate-950 dark:border-white transition-colors cursor-pointer uppercase tracking-wide"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAllItemsModal;
