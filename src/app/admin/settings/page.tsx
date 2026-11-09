"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Cloud,
  Database,
  Save,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminWhatsAppNumber,
  saveAdminWhatsAppNumber,
  getShippingSettings,
  saveShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
} from "@/lib/store";
import { ShippingSettings } from "@/types";

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "LUMERO Décor",
    currency: "INR (₹)",
    supportEmail: "care@lumerodecor.com",
    supportPhone: "+91 98765 43210",
    adminWhatsApp: "+91 98765 43210",
  });
  const [shippingSettings, setShippingSettings] =
    useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAdminWhatsAppNumber().then((phone) => {
      if (phone) {
        setStoreSettings((prev) => ({ ...prev, adminWhatsApp: phone }));
      }
    });
    getShippingSettings().then((settings) => {
      if (settings) {
        setShippingSettings(settings);
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.all([
        saveAdminWhatsAppNumber(storeSettings.adminWhatsApp),
        saveShippingSettings(shippingSettings),
      ]);
      toast.success("Settings Saved", {
        description: "Store shipping rules & WhatsApp details updated successfully.",
      });
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
          Configuration & Gateways
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
          Store Settings
        </h1>
        <p className="text-xs text-stone-500">
          Inspect API credentials, payment endpoints, and shipping policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900 border-b border-stone-200 pb-3">
              Store Logistics & Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Active Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={storeSettings.currency}
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-xs text-stone-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Concierge Support Email
                </label>
                <input
                  type="email"
                  value={storeSettings.supportEmail}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, supportEmail: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Customer Support Phone
                </label>
                <input
                  type="text"
                  value={storeSettings.supportPhone}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, supportPhone: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Shipping Configuration Section */}
              <div className="sm:col-span-2 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <Truck className="h-4 w-4 text-amber-800" />
                  <label className="text-xs font-semibold text-stone-900">
                    Shipping Methods & Delivery Charges
                  </label>
                </div>

                {/* Two Method Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
                  {/* Method 1: Conditional Free Shipping */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setShippingSettings((prev) => ({ ...prev, method: "threshold" }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setShippingSettings((prev) => ({ ...prev, method: "threshold" }));
                      }
                    }}
                    className={`cursor-pointer text-left p-3.5 rounded-xl border transition-all ${
                      shippingSettings.method === "threshold"
                        ? "border-amber-800/80 bg-amber-50/60 ring-1 ring-amber-800/30"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-stone-900">
                          1. Conditional Free Shipping
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          Free shipping when order reaches a certain amount; shipping fee applied below it.
                        </p>
                      </div>
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                          shippingSettings.method === "threshold"
                            ? "border-amber-800 bg-amber-800"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {shippingSettings.method === "threshold" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Method 2: Fixed Shipping Charge */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setShippingSettings((prev) => ({ ...prev, method: "fixed" }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setShippingSettings((prev) => ({ ...prev, method: "fixed" }));
                      }
                    }}
                    className={`cursor-pointer text-left p-3.5 rounded-xl border transition-all ${
                      shippingSettings.method === "fixed"
                        ? "border-amber-800/80 bg-amber-50/60 ring-1 ring-amber-800/30"
                        : "border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-stone-900">
                          2. Fixed Shipping Charge
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          Charge a flat delivery fee on all orders regardless of cart total.
                        </p>
                      </div>
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                          shippingSettings.method === "fixed"
                            ? "border-amber-800 bg-amber-800"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {shippingSettings.method === "fixed" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Configuration Controls based on Selected Method */}
                {shippingSettings.method === "threshold" ? (
                  <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Free Shipping Minimum Order Amount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shippingSettings.threshold_amount}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              threshold_amount: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          Orders at or above this amount get FREE shipping.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Shipping Fee Below Minimum (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={shippingSettings.below_threshold_charge}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              below_threshold_charge: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          Shipping charged when cart total is below the minimum amount.
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg p-2.5 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      <span>
                        <strong>Live Rule:</strong> Orders of{" "}
                        <strong>₹{shippingSettings.threshold_amount.toLocaleString()}</strong> or more get{" "}
                        <strong>FREE</strong> shipping. Orders under ₹{shippingSettings.threshold_amount.toLocaleString()} will be charged{" "}
                        <strong>₹{shippingSettings.below_threshold_charge}</strong> shipping fee.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Fixed Flat Shipping Charge (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={shippingSettings.fixed_charge}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            fixed_charge: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-full sm:max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        Every order will have this flat delivery fee added automatically.
                      </p>
                    </div>

                    <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/70 rounded-lg p-2.5 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      <span>
                        <strong>Live Rule:</strong> Every order will be charged a flat delivery fee of{" "}
                        <strong>₹{shippingSettings.fixed_charge}</strong> regardless of order total.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Store WhatsApp Orders Destination */}
              <div className="sm:col-span-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-stone-900 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#25D366]" />
                    <span>Admin WhatsApp Number (Customer Orders Destination)</span>
                  </label>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active for Product WhatsApp Orders
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={storeSettings.adminWhatsApp}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, adminWhatsApp: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:border-stone-950 focus:ring-1 focus:ring-stone-950 focus:outline-hidden shadow-2xs font-mono"
                />
                <p className="mt-1.5 text-[11px] text-stone-500 leading-relaxed">
                  When a customer clicks <strong>&quot;WhatsApp Order&quot;</strong> on any product page, their selected quantity, price, and product link are automatically sent directly to this WhatsApp number.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 shadow-xs disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Service Integration Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900 border-b border-stone-200 pb-3">
              API Integrations Status
            </h3>

            {/* Supabase */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
              <Database className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-medium text-stone-900">
                    Supabase Database & Auth
                  </strong>
                  <span className="rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-semibold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Tables ready: profiles, products, categories, orders, cms_content.
                </p>
              </div>
            </div>

            {/* Razorpay */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
              <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-medium text-stone-900">
                    Razorpay Payment Gateway
                  </strong>
                  <span className="rounded-md bg-blue-100 text-blue-800 px-1.5 py-0.2 text-[9px] font-semibold uppercase">
                    Integrated
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  UPI, Cards, NetBanking + COD fallback enabled.
                </p>
              </div>
            </div>

            {/* Cloudinary */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
              <Cloud className="h-5 w-5 text-sky-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-medium text-stone-900">
                    Cloudinary Media Storage
                  </strong>
                  <span className="rounded-md bg-sky-100 text-sky-800 px-1.5 py-0.2 text-[9px] font-semibold uppercase">
                    Configured
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Auto-compression active for product images; full deletion on delete.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-[11px] text-amber-900">
              <strong>Tip:</strong> You can edit <code>.env.local</code> in the root folder anytime to switch between live keys and sandbox testing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

