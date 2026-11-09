"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CartItem, Product, ShippingSettings } from "@/types";
import {
  getProducts,
  getShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
} from "@/lib/store";
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
  standardShippingFee: number;
  shippingSettings: ShippingSettings;
  refreshCart: () => Promise<void>;
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

  const syncCartWithLatestProducts = useCallback(
    async (currentItems?: CartItem[], silent = false) => {
      try {
        const [products, loadedShipping] = await Promise.all([
          getProducts(),
          getShippingSettings(),
        ]);

        if (loadedShipping) {
          setShippingSettings(loadedShipping);
        }

        setItems((prev) => {
          const baseItems = currentItems !== undefined ? currentItems : prev;
          if (baseItems.length === 0) return baseItems;

          let hasChanges = false;
          const updated: CartItem[] = [];

          for (const item of baseItems) {
            const latest = products.find((p) => p.id === item.product.id);

            if (!latest || latest.is_archived) {
              hasChanges = true;
              if (!silent) {
                toast.info("Item No Longer Available", {
                  description: `"${item.product.name}" was removed from your bag.`,
                });
              }
              continue;
            }

            if (latest.stock_quantity <= 0) {
              hasChanges = true;
              if (!silent) {
                toast.warning("Item Out of Stock", {
                  description: `"${latest.name}" is now sold out and was removed from your bag.`,
                });
              }
              continue;
            }

            let newQty = item.quantity;
            if (newQty > latest.stock_quantity) {
              newQty = latest.stock_quantity;
              hasChanges = true;
              if (!silent) {
                toast.warning("Quantity Adjusted", {
                  description: `"${latest.name}" quantity adjusted to ${newQty} based on current stock.`,
                });
              }
            }

            const priceChanged = latest.price !== item.product.price;
            const detailsChanged =
              latest.name !== item.product.name ||
              latest.compare_at_price !== item.product.compare_at_price ||
              latest.shipping_fee !== item.product.shipping_fee ||
              latest.stock_quantity !== item.product.stock_quantity;

            if (priceChanged) {
              hasChanges = true;
              if (!silent) {
                toast.info("Price Updated in Bag", {
                  description: `"${latest.name}" price updated from ₹${item.product.price.toLocaleString()} to ₹${latest.price.toLocaleString()}.`,
                });
              }
            } else if (detailsChanged) {
              hasChanges = true;
            }

            updated.push({
              product: latest,
              quantity: newQty,
            });
          }

          if (hasChanges) {
            try {
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
              console.error("Failed to update cart storage", e);
            }
            return updated;
          }

          return baseItems;
        });
      } catch (err) {
        console.error("Failed to sync cart items with latest catalog:", err);
      }
    },
    []
  );

  // Initial load sync
  useEffect(() => {
    let initialItems: CartItem[] = [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        initialItems = JSON.parse(saved);
        setItems(initialItems);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }

    syncCartWithLatestProducts(initialItems, false);
  }, [syncCartWithLatestProducts]);

  // Persist items on state change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items]);

  // Re-sync when cart drawer is opened
  useEffect(() => {
    if (isCartOpen) {
      syncCartWithLatestProducts();
    }
  }, [isCartOpen, syncCartWithLatestProducts]);

  // Live multi-tab & window focus listeners to guarantee updated prices & shipping
  useEffect(() => {
    const handleSync = () => {
      syncCartWithLatestProducts();
    };

    const handleShippingEvent = (e?: Event) => {
      if (e && "detail" in e && (e as CustomEvent).detail) {
        setShippingSettings((e as CustomEvent).detail);
      } else {
        syncCartWithLatestProducts();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === "lumero_catalog_updated_at" ||
        e.key === "lumero_products_v1" ||
        e.key === "lumero_shipping_settings_v1" ||
        e.key === "lumero_settings_v1"
      ) {
        syncCartWithLatestProducts();
      }
    };

    window.addEventListener("focus", handleSync);
    window.addEventListener("lumero_catalog_updated", handleSync);
    window.addEventListener("lumero_shipping_updated", handleShippingEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("lumero_catalog_updated", handleSync);
      window.removeEventListener("lumero_shipping_updated", handleShippingEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncCartWithLatestProducts]);

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
              ? { ...item, product, quantity: product.stock_quantity }
              : item
          );
        }
        toast.success("Updated Bag", {
          description: `Increased ${product.name} quantity to ${newQty}.`,
        });
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, product, quantity: newQty } : item
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

  const refreshCart = async () => {
    await syncCartWithLatestProducts();
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
    0
  );

  // Dynamic shipping calculation
  let shippingFee = 0;
  if (subtotal > 0) {
    const customShippingFees = items
      .map((it) => it.product.shipping_fee)
      .filter((fee): fee is number => typeof fee === "number" && fee > 0);

    if (shippingSettings.method === "threshold") {
      if (subtotal >= shippingSettings.threshold_amount) {
        shippingFee = 0;
      } else if (customShippingFees.length > 0) {
        shippingFee = Math.max(...customShippingFees, shippingSettings.below_threshold_charge);
      } else {
        shippingFee = shippingSettings.below_threshold_charge;
      }
    } else {
      shippingFee = customShippingFees.length > 0
        ? Math.max(...customShippingFees, shippingSettings.fixed_charge)
        : shippingSettings.fixed_charge;
    }
  }

  const freeShippingThreshold =
    shippingSettings.method === "threshold"
      ? shippingSettings.threshold_amount
      : 0;

  const standardShippingFee =
    shippingSettings.method === "threshold"
      ? shippingSettings.below_threshold_charge
      : shippingSettings.fixed_charge;

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
        standardShippingFee,
        shippingSettings,
        refreshCart,
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
