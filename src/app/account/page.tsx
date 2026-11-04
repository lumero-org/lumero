"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  Loader2,
  CheckCircle2,
  Package,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getCustomerOrders,
  getSavedAddress,
  saveCustomerAddress,
} from "@/lib/store";
import { Order, ShippingAddress } from "@/types";
import { toast } from "sonner";
import { CustomerAuthModal } from "@/components/auth/CustomerAuthModal";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAdmin, logout, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "address">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [savedAddress, setSavedAddress] = useState<ShippingAddress>({
    address: "",
    city: "",
    state: "Karnataka",
    postal_code: "",
    country: "India",
    phone: "",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch orders and saved address when user is authenticated
  useEffect(() => {
    if (!user) return;

    getCustomerOrders(user.email, user.id)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setIsLoadingOrders(false));

    getSavedAddress(user.id).then((addr) => {
      if (addr) {
        setSavedAddress(addr);
      } else if (user.saved_address) {
        setSavedAddress(user.saved_address);
      }
    });
  }, [user]);

  // Loading state while checking session (Page skeleton)
  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-pulse space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-stone-200 shrink-0" />
          <div className="space-y-2.5 flex-1">
            <div className="h-6 w-48 bg-stone-200 rounded" />
            <div className="h-4 w-36 bg-stone-200 rounded" />
          </div>
        </div>
        <div className="h-10 w-64 bg-stone-200/70 rounded-xl" />
        <div className="space-y-4">
          <div className="h-44 bg-white rounded-3xl border border-stone-200/80 p-6" />
        </div>
      </div>
    );
  }

  // If not logged in, prompt to sign in
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF8F5] px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/80 shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-900">
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="font-serif text-2xl font-light tracking-[0.2em] text-stone-950 block">
              LUMERO
            </span>
            <h1 className="mt-2 text-xl font-serif font-medium text-stone-900">
              Customer Account
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
              Please sign in to access your order history, delivery tracking, and saved address.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 hover:bg-stone-800 text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition shadow-sm"
          >
            <span>Sign In / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!savedAddress.address || !savedAddress.city || !savedAddress.postal_code) {
      toast.error("Please fill in street address, city, and postal code.");
      return;
    }

    setIsSavingAddress(true);
    try {
      await saveCustomerAddress(user.id, savedAddress);
      toast.success("Address Saved", {
        description: "Your address has been saved and will auto-fill during checkout.",
      });
    } catch {
      toast.error("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Breadcrumbs & User Profile Header */}
      <div className="border-b border-stone-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 mb-3 sm:mb-4">
            <Link href="/" className="hover:text-stone-950 transition">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-900 font-medium">My Account</span>
          </div>

          {/* Profile Row: Avatar + Name + Badges + Sign Out (All in SAME line on mobile & desktop) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-stone-950 text-white flex items-center justify-center font-serif text-base sm:text-2xl font-light shadow-2xs shrink-0 ring-2 ring-stone-100">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-base sm:text-2xl font-serif font-medium text-stone-900 truncate">
                    {user.full_name}
                  </h1>
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                    {isAdmin ? "Admin" : "Customer"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm text-stone-500 font-light truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Actions: Sign Out (and Admin if applicable) */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white bg-stone-950 hover:bg-stone-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full sm:rounded-xl transition shrink-0 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Navigation Tabs (Sleek Segmented Control) */}
        <div className="flex items-center p-1 bg-stone-200/60 rounded-2xl max-w-md w-full mb-6 sm:mb-8 border border-stone-200/50">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 text-xs sm:text-sm rounded-xl transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-white text-stone-950 font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("address")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 text-xs sm:text-sm rounded-xl transition cursor-pointer ${
              activeTab === "address"
                ? "bg-white text-stone-950 font-semibold shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Address</span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 animate-pulse space-y-4 shadow-2xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-36 bg-stone-200 rounded" />
                      <div className="h-5 w-24 bg-stone-200 rounded-full" />
                    </div>
                    <div className="h-px bg-stone-100" />
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-stone-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-44 bg-stone-200 rounded" />
                        <div className="h-3 w-28 bg-stone-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-stone-200/80 shadow-2xs space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-medium text-stone-900">
                  No orders placed yet
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 font-light max-w-xs mx-auto">
                  Your completed purchases and delivery tracking will appear right here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-full bg-stone-950 hover:bg-stone-800 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6">
                {orders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden transition hover:shadow-xs"
                    >
                      {/* Mobile Header (< sm screens) */}
                      <div className="sm:hidden bg-stone-50/80 p-4 border-b border-stone-200/70 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-stone-900">
                            #{order.order_number}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                order.order_status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.order_status === "shipped"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.order_status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-200/70 text-stone-700 uppercase">
                              {order.payment_method === "cod" ? "COD" : "Online"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-stone-500 pt-0.5">
                          <span>Placed on {dateStr}</span>
                          <span className="font-serif font-bold text-sm text-stone-950">
                            ₹{order.total_amount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Desktop Header (>= sm screens) */}
                      <div className="hidden sm:flex bg-stone-50/70 p-5 lg:p-6 border-b border-stone-200/70 items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-stone-500 block text-[11px]">Order Placed</span>
                            <span className="font-medium text-stone-900">{dateStr}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[11px]">Order #</span>
                            <span className="font-mono font-medium text-stone-900">
                              #{order.order_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[11px]">Total</span>
                            <span className="font-serif font-medium text-stone-900">
                              ₹{order.total_amount?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              order.order_status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.order_status === "shipped"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.order_status}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 uppercase">
                            {order.payment_method === "cod" ? "COD" : "Online"}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 sm:gap-4 py-2 border-b border-stone-100 last:border-b-0"
                          >
                            {item.product_image ? (
                              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                                <Image
                                  src={item.product_image}
                                  alt={item.product_name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-400">
                                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-stone-900 truncate">
                                {item.product_name}
                              </h4>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-serif text-xs sm:text-sm font-semibold text-stone-900">
                                ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Destination Footer */}
                      <div className="bg-stone-50/50 px-4 sm:px-6 py-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 gap-2">
                        <span className="flex items-center gap-1.5 truncate min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">
                            {order.shipping_address?.address}, {order.shipping_address?.city}{" "}
                            {order.shipping_address?.postal_code}
                          </span>
                        </span>
                        <Link
                          href={`/order-success/${order.id}`}
                          className="font-semibold text-stone-900 hover:underline shrink-0 inline-flex items-center gap-1"
                        >
                          <span>Receipt</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESS */}
        {activeTab === "address" && (
          <div className="max-w-2xl bg-white rounded-3xl p-5 sm:p-10 border border-stone-200/90 shadow-2xs">
            <div className="mb-5 sm:mb-6 space-y-1">
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-800" />
                <span>Default Shipping Address</span>
              </h3>
              <p className="text-xs text-stone-500">
                This address will be automatically populated when you proceed to checkout.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Street Address / House / Flat No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter street address"
                  value={savedAddress.address}
                  onChange={(e) =>
                    setSavedAddress({ ...savedAddress, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter city"
                    value={savedAddress.city}
                    onChange={(e) =>
                      setSavedAddress({ ...savedAddress, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter PIN code"
                    value={savedAddress.postal_code}
                    onChange={(e) =>
                      setSavedAddress({ ...savedAddress, postal_code: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter state"
                    value={savedAddress.state}
                    onChange={(e) =>
                      setSavedAddress({ ...savedAddress, state: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
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
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Delivery Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={savedAddress.phone || ""}
                  onChange={(e) =>
                    setSavedAddress({ ...savedAddress, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 hover:bg-stone-800 text-white px-8 py-3 text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Address to Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

