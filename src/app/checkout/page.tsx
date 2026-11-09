"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  ArrowRight,
  User,
  MapPin,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  createOrder,
  getSavedAddress,
  saveCustomerAddress,
  acquireStockLockAndVerify,
} from "@/lib/store";
import { toast } from "sonner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, clearCart, refreshCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Form State (Works for Guest & Logged In!)
  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "Karnataka",
    postal_code: "",
    country: "India",
    notes: "",
  });

  useEffect(() => {
    if (!user) return;

    getSavedAddress(user.id).then((saved) => {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.full_name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || saved?.phone || "",
        ...(saved && (saved.address || saved.city)
          ? {
              address: saved.address || prev.address,
              city: saved.city || prev.city,
              state: saved.state || prev.state,
              postal_code: saved.postal_code || prev.postal_code,
              country: saved.country || prev.country || "India",
            }
          : {}),
      }));
      if (saved && (saved.address || saved.city)) {
        setHasSavedAddress(true);
      }
    });
  }, [user]);

  // Reliable Razorpay SDK loader
  const loadRazorpaySdk = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        if (window.Razorpay) resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpaySdk();
  }, []);

  const totalAmount = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const maybeSaveCustomerAddress = async () => {
    if (user && saveAddressForFuture && formData.address) {
      try {
        await saveCustomerAddress(user.id, {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phone,
        });
      } catch (err) {
        console.error("Could not save address:", err);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.postal_code) {
      toast.error("Please complete all shipping address fields.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Concurrency Stock Lock & Availability Guard
      const lockCheck = await acquireStockLockAndVerify(
        items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
          product_name: it.product.name,
        }))
      );
      if (!lockCheck.success) {
        toast.error("Stock Unavailable", {
          description:
            lockCheck.error ||
            "One or more items in your cart are no longer available in the requested quantity.",
        });
        setIsProcessing(false);
        return;
      }

      // 2. RAZORPAY INTEGRATION FLOW
      const createOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          notes: {
            customer_email: formData.email,
            customer_name: formData.name,
          },
        }),
      });

      // Ensure Razorpay SDK is loaded
      await loadRazorpaySdk();

      const rzpOrderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        throw new Error(rzpOrderData.error || "Failed to initialize payment gateway");
      }

      if (!window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout. Please check your internet connection.");
      }

      // Open official Razorpay modal
      const options = {
        key: rzpOrderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TjkztKwbRNdoo1",
        amount: rzpOrderData.amount,
        currency: "INR",
        name: "LUMERO Décor",
        description: "Modern Spaces. Better Living.",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=200&auto=format&fit=crop",
        order_id: rzpOrderData.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          try {
            // Verify payment signature
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              await maybeSaveCustomerAddress();
              const order = await createOrder({
                customer_id: user?.id || null,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: {
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.postal_code,
                  country: formData.country,
                },
                subtotal,
                shipping_fee: shippingFee,
                discount_amount: 0,
                total_amount: totalAmount,
                payment_status: "paid",
                payment_method: "razorpay",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                order_status: "processing",
                notes: formData.notes,
                items: items.map((it) => ({
                  product_id: it.product.id,
                  product_name: it.product.name,
                  product_image: it.product.images[0]?.url || "",
                  price: it.product.price,
                  quantity: it.quantity,
                  total: it.product.price * it.quantity,
                })),
              });

              clearCart();
              toast.success("Payment Received!", {
                description: `Order #${order.order_number} confirmed. Stock reduced.`,
              });
              router.push(`/order-success/${order.id}`);
            } else {
              toast.error("Payment Verification Failed", {
                description: "Signature mismatch. Please contact support.",
              });
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Order creation failed";
            toast.error("Failed to record order", { description: msg });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#1C1917",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: { error?: { description?: string } }) {
        setIsProcessing(false);
        toast.error("Payment Failed", {
          description: response.error?.description || "Transaction was declined.",
        });
      });
      razorpayInstance.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout error";
      toast.error("Checkout Failed", { description: msg });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-light text-stone-900">
          Your Shopping Bag is Empty
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Please select an item from our curated collection before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-stone-900 px-8 py-3 text-xs font-semibold text-white uppercase tracking-wider"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 pb-28 sm:pb-16">
      <div className="mb-8 border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Secure Purchase
          </span>
          <h1 className="mt-1 font-serif text-3xl font-normal text-stone-950">
            Express Checkout
          </h1>
        </div>

        {/* Guest vs User status indicator */}
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 border border-stone-200 shadow-2xs text-xs">
          <User className="h-4 w-4 text-stone-500" />
          <span>
            {user ? (
              <>
                Signed in as <strong className="text-stone-900">{user.full_name}</strong>
              </>
            ) : (
              <>
                Checking out as <strong className="text-stone-900">Guest</strong> (No account required)
              </>
            )}
          </span>
        </div>
      </div>

      <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Customer & Shipping Information */}
        <div className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-800" />
              <span>Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Phone Number (For Courier SMS) *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address (For Order Receipt) *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-800" />
                <span>Shipping Address</span>
              </h2>
              {hasSavedAddress && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Pre-filled with your Saved Address
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Street Address & Apartment *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  name="postal_code"
                  placeholder="Enter PIN code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-2.5 text-xs text-stone-600 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  placeholder="Enter delivery instructions (optional)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              {user && (
                <div className="sm:col-span-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 select-none">
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 accent-stone-900"
                    />
                    <span>Save / update this shipping address to my account for future orders</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-800" />
              <span>Payment Method</span>
            </h2>

            <div className="p-4 rounded-2xl border border-stone-950 bg-stone-50/70 ring-1 ring-stone-950">
              <div className="flex items-center justify-between">
                <span className="font-serif font-medium text-sm text-stone-950">
                  Razorpay Secure Checkout
                </span>
                <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  100% Encrypted
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                Pay safely via <strong>UPI</strong> (Google Pay, PhonePe, Paytm, BHIM), <strong>Credit / Debit Cards</strong> (Visa, Mastercard, RuPay), <strong>NetBanking</strong>, or <strong>Wallets</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl bg-white p-6 sm:p-8 border border-stone-200 shadow-md space-y-6">
            <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-200 pb-3">
              Order Summary ({items.length} item{items.length > 1 ? "s" : ""})
            </h2>

            {/* Items list */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 py-2 border-b border-stone-100 last:border-0">
                  <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image
                      src={item.product.images[0]?.url || "/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="font-serif text-xs font-medium text-stone-900 line-clamp-1">
                        {item.product.name}
                      </span>
                      <span className="font-semibold text-xs text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Qty: {item.quantity} × ₹{item.product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal, Shipping, Total */}
            <div className="space-y-2 text-xs border-t border-stone-200 pt-4 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-emerald-700 uppercase">Free</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-stone-950 border-t border-stone-200 pt-3">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-stone-950 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Authorize with Razorpay • ₹{totalAmount.toLocaleString()}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>256-bit Encrypted Checkout • Stock Reserved</span>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile Fixed Bottom Bar (Price on left, Buy Now button on right) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium block">
            Total Price
          </span>
          <span className="font-serif text-lg font-bold text-stone-950">
            ₹{totalAmount.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={isProcessing}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 px-5 text-xs font-semibold uppercase tracking-wider text-white shadow-md active:scale-95 transition disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Buy Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

