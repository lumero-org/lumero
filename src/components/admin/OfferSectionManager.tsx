"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { getOfferBanner, saveOfferBanner } from "@/lib/store";
import { OfferBannerContent } from "@/types";
import { toast } from "sonner";

export function OfferSectionManager() {
  const [offer, setOffer] = useState<OfferBannerContent>({
    image_url: "",
    image_public_id: "",
    subtitle: "",
    heading: "Curated Living Spaces with Architectural Serenity",
    description: "Discover our signature travertine trays, hand-carved ceramics, and architectural glow designed to bring tranquility to modern interiors.",
    button_text: "Shop Now",
    button_link: "/shop",
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getOfferBanner()
      .then((data) => {
        if (data) setOffer(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer.heading.trim()) {
      toast.error("Please enter a main heading for the offer banner.");
      return;
    }

    setIsSaving(true);
    try {
      await saveOfferBanner(offer);
      toast.success("Offer Section Published", {
        description: "Homepage promotional banner updated and persisted to database.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save offer";
      toast.error("Save Error", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
        <p className="text-xs">Loading Offer Section settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Overview Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Homepage Promotional Banner
            </span>
            <h3 className="font-serif text-lg font-medium text-stone-900 mt-0.5">
              Offer Section Configuration
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Appears immediately below the Featured Products section on the storefront.
            </p>
          </div>

          {/* Active Status Switch */}
          <label className="flex items-center gap-3 cursor-pointer bg-stone-50 border border-stone-200 px-4 py-2 rounded-2xl shrink-0">
            <span className="text-xs font-medium text-stone-700">Display on Storefront:</span>
            <input
              type="checkbox"
              checked={offer.is_active}
              onChange={(e) => setOffer({ ...offer, is_active: e.target.checked })}
              className="h-4 w-4 rounded-md text-stone-900 focus:ring-stone-900"
            />
            <span className={`text-xs font-semibold ${offer.is_active ? "text-emerald-700" : "text-stone-400"}`}>
              {offer.is_active ? "Active" : "Hidden"}
            </span>
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Background Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
              Banner Background Image
            </label>
            <p className="text-xs text-stone-500 mb-3">
              Upload a high-resolution landscape photo (recommended: 1920x1080 or 1600x900).
            </p>
            <CloudinaryUploader
              images={
                offer.image_url
                  ? [{ url: offer.image_url, public_id: offer.image_public_id || "offer_bg" }]
                  : []
              }
              onChange={(imgs) => {
                setOffer({
                  ...offer,
                  image_url: imgs[0]?.url || "",
                  image_public_id: imgs[0]?.public_id,
                });
              }}
              maxImages={1}
              isProduct={false}
              folder="lumero/offers"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                Subtitle Badge
              </label>
              <input
                type="text"
                value={offer.subtitle}
                onChange={(e) => setOffer({ ...offer, subtitle: e.target.value })}
                placeholder="e.g. Limited Seasonal Offer"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
                CTA Button Text
              </label>
              <input
                type="text"
                value={offer.button_text}
                onChange={(e) => setOffer({ ...offer, button_text: e.target.value })}
                placeholder="Shop Now"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Main Heading */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
              Main Heading *
            </label>
            <input
              type="text"
              required
              value={offer.heading}
              onChange={(e) => setOffer({ ...offer, heading: e.target.value })}
              placeholder="e.g. Curated Living Spaces with Architectural Serenity"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-900 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
              Short Description
            </label>
            <textarea
              rows={3}
              value={offer.description}
              onChange={(e) => setOffer({ ...offer, description: e.target.value })}
              placeholder="Provide a compelling 1-2 sentence overview of this offer or promotion..."
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          {/* Button Destination Path */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
              Button Navigation Destination
            </label>
            <input
              type="text"
              value={offer.button_link}
              onChange={(e) => setOffer({ ...offer, button_link: e.target.value })}
              placeholder="e.g. /shop or /shop?category=lighting"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Enter relative path (e.g., &quot;/shop&quot; or &quot;/shop?category=lighting&quot;).
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Publishing Offer...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save &amp; Publish Offer Section</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

