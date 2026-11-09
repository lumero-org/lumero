"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Truck,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminWhatsAppNumber,
  saveAdminWhatsAppNumber,
  getShippingSettings,
  saveShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
  getStoreSettings,
  saveStoreSettings,
  defaultStoreSettings,
} from "@/lib/store";
import { ShippingSettings, StoreSettings } from "@/types";

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [shippingSettings, setShippingSettings] =
    useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [loadedStore, loadedShipping, phone] = await Promise.all([
          getStoreSettings(),
          getShippingSettings(),
          getAdminWhatsAppNumber(),
        ]);
        if (loadedStore) {
          setStoreSettings({
            ...loadedStore,
            adminWhatsApp: phone || loadedStore.adminWhatsApp || "+91 98765 43210",
          });
        }
        if (loadedShipping) {
          setShippingSettings(loadedShipping);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.all([
        saveStoreSettings(storeSettings),
        saveShippingSettings(shippingSettings),
        saveAdminWhatsAppNumber(storeSettings.adminWhatsApp || ""),
      ]);
      toast.success("Settings Saved", {
        description: "Store information, contact details, and shipping rules updated successfully.",
      });
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
          Configuration & Logistics
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
          Store Settings
        </h1>
        <p className="text-xs text-stone-500">
          Manage store identity, concierge support channels, and dynamic shipping delivery rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl bg-white p-6 sm:p-7 border border-stone-200 shadow-2xs space-y-6">
        <div>
          <h3 className="font-serif text-base font-medium text-stone-900 border-b border-stone-200 pb-2">
            Store Identity & Contact Details
          </h3>
          <p className="text-[11px] text-stone-500 mt-1">
            These contact channels are displayed dynamically on your customer contact page.
          </p>
        </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Brand / Studio Name
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
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-amber-800" />
                  <span>Concierge Support Email</span>
                </label>
                <input
                  type="email"
                  value={storeSettings.supportEmail}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, supportEmail: e.target.value })
                  }
                  placeholder="care@lumerodecor.com"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-amber-800" />
                  <span>Customer Support Phone</span>
                </label>
                <input
                  type="text"
                  value={storeSettings.supportPhone}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, supportPhone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-800" />
                  <span>Phone Assistance Hours</span>
                </label>
                <input
                  type="text"
                  value={storeSettings.supportHours || ""}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, supportHours: e.target.value })
                  }
                  placeholder="Mon-Sat, 10am - 7pm IST"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-800" />
                  <span>Response Window</span>
                </label>
                <input
                  type="text"
                  value={storeSettings.responseWindow || ""}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, responseWindow: e.target.value })
                  }
                  placeholder="Usually within 4 business hours"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-800" />
                  <span>Studio &amp; Store Location Address</span>
                </label>
                <textarea
                  rows={2}
                  value={storeSettings.locationAddress || ""}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, locationAddress: e.target.value })
                  }
                  placeholder="e.g. 104, Indiranagar 100ft Road, Defence Colony, Bengaluru, Karnataka 560038"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-stone-500">
                  Displayed on the storefront customer contact page under Studio &amp; Location.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Contact Page Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={storeSettings.contactSubtitle || ""}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, contactSubtitle: e.target.value })
                  }
                  placeholder="Crafting calm, elevated living spaces across India with care and dedication."
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
            className="flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

