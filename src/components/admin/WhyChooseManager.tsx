"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { getWhyChooseSection, saveWhyChooseSection } from "@/lib/store";
import { WhyChooseSection, WhyChooseItem } from "@/types";
import { toast } from "sonner";

export function WhyChooseManager() {
  const [data, setData] = useState<WhyChooseSection>({
    image_url: "",
    image_public_id: "",
    subtitle: "The LUMERO Standard",
    title: "Why Choose Lumero",
    items: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getWhyChooseSection()
      .then((res) => {
        if (res) {
          setData(res);
        } else {
          // Initial starter structure if nothing stored in DB yet
          setData({
            image_url: "",
            image_public_id: "",
            subtitle: "The LUMERO Standard",
            title: "Why Choose Lumero",
            items: [
              {
                id: `item_1`,
                title: "Architectural Precision",
                description:
                  "Every silhouette is engineered with disciplined proportion and geometric balance to bring visual calm to living spaces.",
                sort_order: 1,
              },
              {
                id: `item_2`,
                title: "Pure Raw Materials",
                description:
                  "Natural unfilled travertine stone, genuine fluted stoneware, and hand-rubbed solid walnut sourced responsibly.",
                sort_order: 2,
              },
              {
                id: `item_3`,
                title: "Safe Reinforced Delivery",
                description:
                  "Custom double-wall corrugated packaging with drop-tested interior molds to ensure zero transit damage.",
                sort_order: 3,
              },
            ],
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Accordion item manipulation
  const handleAddItem = () => {
    const newItem: WhyChooseItem = {
      id: `why_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: "New Value Proposition",
      description: "Describe what makes Lumero décor exceptional...",
      sort_order: data.items.length + 1,
    };
    setData({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<WhyChooseItem>) => {
    setData({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    });
  };

  const handleDeleteItem = (id: string) => {
    setData({
      ...data,
      items: data.items.filter((it) => it.id !== id),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...data.items];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    // Reassign sort orders
    const updated = items.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    setData({ ...data, items: updated });
  };

  const handleMoveDown = (index: number) => {
    if (index === data.items.length - 1) return;
    const items = [...data.items];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    // Reassign sort orders
    const updated = items.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    setData({ ...data, items: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveWhyChooseSection(data);
      toast.success("Why Choose Lumero Section Updated", {
        description: "Accordion content & featured image published and saved to database.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Failed to save", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-stone-400 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
        <p className="text-xs">Loading Why Choose Lumero settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header Info */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            About Page Featured Section
          </span>
          <h3 className="font-serif text-lg font-medium text-stone-900 mt-0.5">
            Why Choose Lumero Management
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Featured on the About Us page with large architectural photography and interactive accordions.
          </p>
        </div>

        {/* Section Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
              Section Subtitle
            </label>
            <input
              type="text"
              value={data.subtitle || ""}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              placeholder="e.g. The LUMERO Standard"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
              Main Section Title
            </label>
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="e.g. Why Choose Lumero"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Left-Side Large Featured Image */}
        <div className="pt-2 border-t border-stone-200/80">
          <label className="block text-xs font-semibold text-stone-700 mb-1 uppercase tracking-wider">
            Left-Side Featured Image (Cloudinary)
          </label>
          <p className="text-xs text-stone-500 mb-3">
            Upload an editorial portrait or lifestyle image (recommended: 4:5 aspect ratio, e.g. 1200x1500).
          </p>
          <CloudinaryUploader
            images={
              data.image_url
                ? [{ url: data.image_url, public_id: data.image_public_id || "why_choose_img" }]
                : []
            }
            onChange={(imgs) => {
              setData({
                ...data,
                image_url: imgs[0]?.url || "",
                image_public_id: imgs[0]?.public_id,
              });
            }}
            maxImages={1}
            isProduct={false}
            folder="lumero/why-choose"
          />
        </div>
      </div>

      {/* Accordion Items Manager */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h4 className="font-serif text-base font-medium text-stone-900">
              Accordion Items ({data.items.length})
            </h4>
            <p className="text-xs text-stone-500">
              Add, edit, reorder, or delete the accordion cards displayed on the storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider hover:bg-stone-800 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Accordion Item</span>
          </button>
        </div>

        {data.items.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
            No accordion items added yet. Click &quot;Add Accordion Item&quot; above to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5]/60 p-4 sm:p-5 space-y-3 transition hover:border-stone-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                      Accordion Item #{index + 1}
                    </span>
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === data.items.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 ml-1"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Accordion Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                    placeholder="Accordion Title (e.g. Architectural Precision)"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Accordion Description
                  </label>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                    placeholder="Accordion detailed description..."
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-800 focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save &amp; Publish Why Choose Lumero</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

