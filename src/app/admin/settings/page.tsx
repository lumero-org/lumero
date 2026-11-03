"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Cloud,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminWhatsAppNumber, saveAdminWhatsAppNumber } from "@/lib/store";

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "LUMERO Décor",
    currency: "INR (₹)",
    freeShippingThreshold: 1999,
    supportEmail: "care@lumerodecor.com",
    supportPhone: "+91 98765 43210",
    adminWhatsApp: "+91 98765 43210",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAdminWhatsAppNumber().then((phone) => {
      if (phone) {
        setStoreSettings((prev) => ({ ...prev, adminWhatsApp: phone }));
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveAdminWhatsAppNumber(storeSettings.adminWhatsApp);
      toast.success("Settings Saved", {
        description: "Store WhatsApp order destination & logistics updated.",
      });
    } catch {
      toast.error("Failed to save settings");
    } finally {
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
                  Complimentary Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={storeSettings.freeShippingThreshold}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      freeShippingThreshold: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
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

