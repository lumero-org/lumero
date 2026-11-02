"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    totalItems,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-stone-50 border-l border-stone-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-stone-800" />
              <h2 className="text-lg font-serif font-medium text-stone-900">
                Shopping Bag
              </h2>
              <span className="ml-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3.5 bg-stone-100/70 border-b border-stone-200">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-stone-600 mb-2">
                Add <span className="font-semibold text-stone-900">₹{amountNeededForFreeShipping.toLocaleString()}</span> more for <span className="font-medium text-amber-800">Complimentary Delivery</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-emerald-800 flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Unlocked: You qualify for Complimentary Delivery!
              </p>
            )}
            <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-stone-900 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-4">
                  <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Your bag is currently empty
                </h3>
                <p className="mt-1 text-sm text-stone-500 max-w-xs">
                  Discover refined décor pieces crafted to bring warmth and understated elegance to your home.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-100">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif text-sm font-medium text-stone-900 line-clamp-1 hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 uppercase tracking-wide">
                        {item.product.category_name || "Home Décor"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-1 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.product.stock_quantity}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-stone-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-stone-200 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-800">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="font-medium text-emerald-700 uppercase text-xs">
                        Free
                      </span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-semibold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Estimated Total</span>
                  <span>₹{(subtotal + shippingFee).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-stone-800 shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <p className="text-center text-[11px] text-stone-400">
                  Taxes calculated at checkout • Razorpay & COD Available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

