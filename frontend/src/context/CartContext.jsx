import React, { createContext, useContext, useState, useMemo } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const { showWarning } = useToast();

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      const currentQty = existingIndex > -1 ? prevItems[existingIndex].quantity : 0;
      const requestedQty = currentQty + quantity;

      // Stock check on UI side
      if (requestedQty > product.stockQuantity) {
        showWarning(
          `Stock limit: only ${product.stockQuantity} ${product.unit} available for ${product.name}`
        );
        return prevItems;
      }

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: requestedQty,
        };
        return updated;
      } else {
        return [...prevItems, { product, quantity: requestedQty }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          if (newQuantity > item.product.stockQuantity) {
            showWarning(
              `Stock limit reached! Max available: ${item.product.stockQuantity} ${item.product.unit}`
            );
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setDiscountAmount(0);
    setPaymentMethod('CASH');
  };

  const calculations = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    cartItems.forEach((item) => {
      const lineTotal = item.product.sellingPrice * item.quantity;
      const itemTax = lineTotal * ((item.product.taxRate || 0) / 100);
      subtotal += lineTotal;
      taxTotal += itemTax;
    });

    const discount = Math.min(Number(discountAmount) || 0, subtotal);
    const grandTotal = Math.max(0, subtotal - discount + taxTotal);

    return {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      itemCount: cartItems.length,
      totalUnits: cartItems.reduce((acc, item) => acc + Number(item.quantity), 0),
    };
  }, [cartItems, discountAmount]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedCustomer,
        setSelectedCustomer,
        discountAmount,
        setDiscountAmount,
        paymentMethod,
        setPaymentMethod,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        ...calculations,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
