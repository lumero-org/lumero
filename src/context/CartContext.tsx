"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product, ShippingSettings } from "@/types";
import { getShippingSettings, DEFAULT_SHIPPING_SETTINGS } from "@/lib/store";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  shippingSettings: ShippingSettings;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "lumero_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lumero_shipping_settings_v1");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load shipping settings", e);
      }
    }
    return DEFAULT_SHIPPING_SETTINGS;
  });

  useEffect(() => {
    let isMounted = true;
    getShippingSettings().then((s) => {
      if (isMounted && s) {
        setShippingSettings(s);
      }
    });

    const handleSync = (e?: Event) => {
      if (!isMounted) return;
      if (e && "detail" in e && (e as CustomEvent).detail) {
        setShippingSettings((e as CustomEvent).detail);
        return;
      }
      try {
        const saved = localStorage.getItem("lumero_shipping_settings_v1");
        if (saved) {
          setShippingSettings(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener("lumero_shipping_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("lumero_shipping_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock_quantity <= 0) {
      toast.error("Item Out of Stock", {
        description: `Sorry, ${product.name} is currently out of stock.`,
      });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock_quantity) {
          toast.warning("Stock Limit Reached", {
            description: `Only ${product.stock_quantity} units available in stock.`,
          });
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: product.stock_quantity }
              : item
          );
        }
        toast.success("Updated Bag", {
          description: `Increased ${product.name} quantity to ${newQty}.`,
        });
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      const addQty = Math.min(quantity, product.stock_quantity);
      toast.success("Added to Bag", {
        description: `${product.name} has been added to your shopping bag.`,
      });
      return [...prev, { product, quantity: addQty }];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock_quantity;
          if (quantity > maxStock) {
            toast.warning("Maximum Stock Reached", {
              description: `Only ${maxStock} units available.`,
            });
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.product.id === productId);
      if (target) {
        toast.info("Item Removed", {
          description: `${target.product.name} was removed from your bag.`,
        });
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let shippingFee = 0;
  if (subtotal > 0) {
    if (shippingSettings.method === "threshold") {
      shippingFee =
        subtotal >= shippingSettings.threshold_amount
          ? 0
          : shippingSettings.below_threshold_charge;
    } else {
      shippingFee = shippingSettings.fixed_charge;
    }
  }

  const freeShippingThreshold =
    shippingSettings.method === "threshold"
      ? shippingSettings.threshold_amount
      : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        shippingSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

