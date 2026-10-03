import React, { useState, useRef, useEffect } from 'react';
import { Printer, X, CheckCircle, Copy, Check, Store } from 'lucide-react';

const InvoicePrintModal = ({ order, shopSettings, onClose }) => {
  const [printFormat, setPrintFormat] = useState('thermal'); // 'thermal' or 'a4'
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef();

  // Escape key to close
  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(order.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currency = shopSettings?.currencySymbol || '₹';
  const shopName = shopSettings?.shopName || 'Sweet Delights Bakery & Cafe';
  const shopAddress = shopSettings?.address || '42 Artisan Boulevard, Pastry District';
  const shopPhone = shopSettings?.phone || '+91 98765 43210';
  const shopEmail = shopSettings?.email || 'order@sweetdelights.com';
  const defaultTaxRate = shopSettings?.defaultTaxRate || '5.00';
  const footerText = shopSettings?.receiptFooterText || 'Thank you for tasting happiness! Visit us again soon.';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] transition-colors">
        {/* Modal Top Header Bar */}
        <div className="p-4 px-6 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 dark:text-slate-100 text-base sm:text-lg">Order Completed Successfully</h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-mono font-bold">Invoice #{order.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Format Selector Pills */}
            <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border-2 border-slate-900 dark:border-slate-800 text-xs sm:text-sm font-bold">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  printFormat === 'thermal'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
                }`}
              >
                Thermal Receipt
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  printFormat === 'a4'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black shadow-xs'
                    : 'text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
                }`}
              >
                Standard A4
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-700 hover:text-black dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950/60 flex justify-center">
          {printFormat === 'thermal' ? (
            /* THERMAL RECEIPT (80mm) */
            <div
              id="printable-invoice"
              ref={receiptRef}
              className="w-full max-w-sm bg-white text-slate-900 p-6 rounded-2xl shadow-xl font-mono text-xs border border-slate-200 leading-relaxed"
            >
              {/* Shop Header */}
              <div className="text-center pb-4 mb-3 border-b-2 border-dashed border-slate-300">
                <div className="flex justify-center mb-1">
                  <Store className="w-6 h-6 text-slate-900" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-950">{shopName}</h2>
                <p className="text-[10px] text-slate-600 font-sans mt-0.5">{shopAddress}</p>
                <p className="text-[10px] text-slate-600 font-sans">Tel: {shopPhone}</p>
              </div>

              {/* Invoice Key Meta Grid */}
              <div className="space-y-1 mb-4 pb-3 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-600">INVOICE NO:</span>
                  <span className="text-slate-950 font-mono tracking-wide">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Date & Time:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Cashier Staff:</span>
                  <span className="font-semibold">{order.cashierName}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Customer Name:</span>
                  <span className="font-bold">{order.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-1">
                  <span>Payment Mode:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 uppercase font-extrabold text-[10px] border border-slate-300">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left mb-4">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[10px] text-slate-700 uppercase font-bold">
                    <th className="pb-1.5 pl-0">Item Name</th>
                    <th className="pb-1.5 text-center">Qty</th>
                    <th className="pb-1.5 text-right">Price</th>
                    <th className="pb-1.5 text-right pr-0">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-1 font-bold text-slate-900 leading-tight">
                        {item.productName}
                      </td>
                      <td className="py-2 text-center font-medium">{item.quantity}</td>
                      <td className="py-2 text-right text-slate-700 font-mono">
                        {currency}{Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2 text-right font-bold text-slate-950 font-mono">
                        {currency}{Number(item.lineTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Math Totals Box */}
              <div className="pt-3 border-t-2 border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono">{currency}{Number(order.subtotal).toFixed(2)}</span>
                </div>

                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-{currency}{Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>GST Tax ({defaultTaxRate}%):</span>
                  <span className="font-mono">+{currency}{Number(order.taxAmount).toFixed(2)}</span>
                </div>

                {/* High Contrast Grand Total Banner */}
                <div className="mt-3 p-3 bg-slate-950 text-white rounded-xl flex justify-between items-center text-sm font-extrabold shadow-md">
                  <span className="uppercase tracking-wider">Grand Total</span>
                  <span className="text-base text-amber-400 font-mono">
                    {currency}{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-dashed border-slate-300 text-center font-sans text-[10px] text-slate-500">
                <p className="font-semibold text-slate-800">{footerText}</p>
                <p className="text-[9px] text-slate-400 mt-1">Powered by BakeryPOS Enterprise</p>
              </div>
            </div>
          ) : (
            /* STANDARD A4 INVOICE */
            <div
              id="printable-invoice"
              ref={receiptRef}
              className="w-full bg-white text-slate-900 p-8 rounded-2xl shadow-xl font-sans text-xs border border-slate-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-6 mb-6 border-b-2 border-slate-200">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">{shopName}</h1>
                  <p className="text-slate-600 mt-1">{shopAddress}</p>
                  <p className="text-slate-600">Tel: {shopPhone} | Email: {shopEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    TAX INVOICE
                  </span>
                  <p className="text-sm font-extrabold font-mono text-slate-950 mt-2">{order.invoiceNumber}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 mb-6 border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Customer Info</p>
                  <p className="font-bold text-slate-950 text-sm">{order.customerName}</p>
                  {order.customerPhone && <p className="text-slate-600 mt-0.5">Phone: {order.customerPhone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Order Summary</p>
                  <p className="text-slate-700">Cashier: <span className="font-semibold text-slate-950">{order.cashierName}</span></p>
                  <p className="text-slate-700 mt-0.5">Payment Method: <span className="font-extrabold text-slate-950 uppercase">{order.paymentMethod}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left mb-6 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-y border-slate-300">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">GST %</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-semibold text-slate-950">{item.productName}</td>
                      <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">{currency}{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">{item.taxRate}%</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-950 font-mono">
                        {currency}{Number(item.lineTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Math Summary */}
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{currency}{Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount:</span>
                      <span className="font-mono">-{currency}{Number(order.discountAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Total GST Tax:</span>
                    <span className="font-mono">+{currency}{Number(order.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-2 border-t-2 border-slate-900 text-slate-950">
                    <span>Grand Total:</span>
                    <span className="text-amber-600 font-mono">{currency}{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* A4 Footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-[11px]">
                <p className="font-semibold text-slate-800">{footerText}</p>
                <p className="text-[10px] text-slate-400 mt-1">This is a computer generated invoice</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <button
            onClick={handleCopyInvoiceNumber}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Invoice # Copied!' : 'Copy Invoice #'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close / New Order
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printFormat === 'thermal' ? 'Receipt' : 'A4 Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintModal;
