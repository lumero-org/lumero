"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  User,
  MapPin,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder } from "@/lib/store";
import { toast } from "sonner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.full_name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const totalAmount = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      // 1. CASH ON DELIVERY (COD) FLOW
      if (paymentMethod === "cod") {
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
          payment_status: "cod",
          payment_method: "cod",
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
        toast.success("Order Placed Successfully!", {
          description: `Order #${order.order_number} confirmed with Cash on Delivery.`,
        });
        router.push(`/order-success/${order.id}`);
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

      const rzpOrderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        throw new Error(rzpOrderData.error || "Failed to initialize payment gateway");
      }

      // If in demo mode or script not available, simulate payment completion
      if (!window.Razorpay || rzpOrderData.demoMode) {
        toast.info("Razorpay Gateway Demo Active", {
          description: "Simulating authentic Razorpay authorization & stock reduction...",
        });

        // Simulate network payment time
        await new Promise((r) => setTimeout(r, 1200));

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
          razorpay_order_id: rzpOrderData.id,
          razorpay_payment_id: `pay_${Date.now()}`,
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
        toast.success("Payment Verified & Order Confirmed!", {
          description: `Razorpay Order #${order.order_number} processed. Stock updated.`,
        });
        router.push(`/order-success/${order.id}`);
        return;
      }

      // Open official Razorpay modal
      const options = {
        key: rzpOrderData.key_id,
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
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

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                  placeholder="e.g. Arjun Kapoor"
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
                  placeholder="+91 98765 43210"
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
                  placeholder="arjun@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-800" />
              <span>Shipping Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Street Address & Apartment *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  placeholder="Flat 402, Oakwood Sanctuary, 12th Main"
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
                  placeholder="Bengaluru"
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
                  placeholder="560038"
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
                  placeholder="Karnataka"
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
                  placeholder="Leave with security gate, fragile ceramic instructions, etc."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2 text-xs focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-800" />
              <span>Select Payment Method</span>
            </h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "razorpay"
                    ? "border-stone-950 bg-stone-50/70 ring-1 ring-stone-950"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-medium text-sm text-stone-950">
                      Razorpay Secure (UPI, Cards, NetBanking, Wallets)
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Instant authorization via Google Pay, PhonePe, Paytm, Credit/Debit cards & EMI.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "cod"
                    ? "border-stone-950 bg-stone-50/70 ring-1 ring-stone-950"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-medium text-sm text-stone-950">
                      Cash on Delivery (Pay upon Receipt)
                    </span>
                    <Truck className="h-4 w-4 text-stone-400" />
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Pay in cash or UPI directly to our delivery courier at your doorstep.
                  </p>
                </div>
              </label>
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
                  <span>
                    {paymentMethod === "razorpay" ? "Authorize with Razorpay" : "Confirm COD Order"} • ₹{totalAmount.toLocaleString()}
                  </span>
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
    </div>
  );
}

