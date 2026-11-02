"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  Save,
  CheckCircle2,
  XCircle,
  Sparkles,
  Smartphone,
  Monitor,
  X,
  RefreshCw,
  Sliders,
  UploadCloud,
} from "lucide-react";
import { HeroSlide } from "@/types";
import { getHeroSlides, saveHeroSlides } from "@/lib/store";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { HeroSection } from "@/components/home/HeroSection";
import { fileToDataUrl } from "@/lib/imageCompressor";
import { toast } from "sonner";

// Sample luxury decor templates with both desktop & portrait mobile crops
const SAMPLE_DECOR_SLIDES: Omit<HeroSlide, "id" | "sort_order">[] = [
  {
    badge: "PREMIUM HOME DÉCOR",
    title: "Make Every Corner Feel Beautiful.",
    description:
      "Discover carefully selected décor pieces that transform ordinary rooms into elegant living spaces. Modern, minimal and made to last.",
    image_url:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop",
    image_public_id: "lumero/hero-1",
    mobile_image_url:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=900&auto=format&fit=crop",
    mobile_image_public_id: "lumero/hero-1-mob",
    cta_primary_text: "Shop Collection",
    cta_primary_link: "/shop",
    cta_secondary_text: "Our Story",
    cta_secondary_link: "/about",
    is_active: true,
  },
  {
    badge: "ARCHITECTURAL AMBIENCE",
    title: "Sculptural Lighting & Warm Textures.",
    description:
      "Organic ceramics, honed travertine, and warm diffused lighting designed to bring serene tactile calm to your modern interior.",
    image_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    image_public_id: "lumero/hero-2",
    mobile_image_url:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop",
    mobile_image_public_id: "lumero/hero-2-mob",
    cta_primary_text: "Explore Lighting",
    cta_primary_link: "/shop?category=lighting",
    cta_secondary_text: "View Catalog",
    cta_secondary_link: "/shop",
    is_active: true,
  },
  {
    badge: "NORDIC MINIMALISM",
    title: "Timeless Essentials for Modern Living.",
    description:
      "Handcrafted fluted terracotta vases, minimalist arch mirrors, and solid walnut accents made to elevate everyday routines.",
    image_url:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop",
    image_public_id: "lumero/hero-3",
    mobile_image_url:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=900&auto=format&fit=crop",
    mobile_image_public_id: "lumero/hero-3-mob",
    cta_primary_text: "Discover Pieces",
    cta_primary_link: "/shop",
    cta_secondary_text: "About Lumero",
    cta_secondary_link: "/about",
    is_active: true,
  },
];

export function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");

  // Load slides from database on mount
  useEffect(() => {
    async function load() {
      try {
        const loaded = await getHeroSlides();
        setSlides(loaded);
      } catch (e) {
        console.error("Failed to load hero slides:", e);
        toast.error("Failed to load hero slides from database");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Add a new slide
  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      badge: "PREMIUM HOME DÉCOR",
      title: "New Headline",
      description: "Enter a brief, elegant description for this decor collection.",
      image_url: "",
      image_public_id: "",
      mobile_image_url: "",
      mobile_image_public_id: "",
      cta_primary_text: "Shop Collection",
      cta_primary_link: "/shop",
      cta_secondary_text: "Our Story",
      cta_secondary_link: "/about",
      is_active: true,
      sort_order: slides.length,
    };
    setSlides([...slides, newSlide]);
    toast.info("New slide draft added. Upload images and fill in content.");
  };

  // Seed sample decor slides
  const handleSeedSamples = () => {
    const seeded: HeroSlide[] = SAMPLE_DECOR_SLIDES.map((s, idx) => ({
      ...s,
      id: `slide_seed_${Date.now()}_${idx}`,
      sort_order: idx,
    }));
    setSlides(seeded);
    toast.success("Loaded 3 luxury decor slide templates with desktop & mobile banners. Click 'Save and Publish' to publish.");
  };

  // Delete a slide
  const handleDeleteSlide = (id: string) => {
    if (confirm("Are you sure you want to delete this hero slide?")) {
      setSlides(slides.filter((s) => s.id !== id));
      toast.success("Slide removed from draft list");
    }
  };

  // Toggle active status
  const handleToggleActive = (index: number) => {
    setSlides((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], is_active: !updated[index].is_active };
      }
      return updated;
    });
  };

  // Update slide single field (using functional state to prevent stale closure)
  const handleUpdateField = <K extends keyof HeroSlide>(
    index: number,
    field: K,
    value: HeroSlide[K]
  ) => {
    setSlides((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Update multiple slide fields atomically (guarantees image_url and public_id update simultaneously)
  const handleUpdateFields = (
    index: number,
    updates: Partial<HeroSlide>
  ) => {
    setSlides((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...updates };
      }
      return updated;
    });
  };

  // Move slide up / down
  const handleMove = (index: number, direction: "up" | "down") => {
    setSlides((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setSlides((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.info("Slide order updated. Remember to click 'Save & Publish' below.");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Direct Mobile Banner Upload Handler
  const handleDirectUploadMobile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading mobile banner...");
    try {
      const dataPayload = await fileToDataUrl(file);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataPayload,
          folder: "lumero/hero-mobile",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Atomically update both mobile_image_url and mobile_image_public_id
      handleUpdateFields(index, {
        mobile_image_url: data.url,
        mobile_image_public_id: data.public_id,
      });

      toast.success("Mobile banner uploaded! Click 'Save & Publish' below to publish.", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error("Failed to upload mobile banner", { id: toastId, description: msg });
    } finally {
      e.target.value = "";
    }
  };

  // Direct Desktop Banner Upload Handler
  const handleDirectUploadDesktop = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading desktop banner...");
    try {
      const dataPayload = await fileToDataUrl(file);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataPayload,
          folder: "lumero/hero",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Atomically update both image_url and image_public_id
      handleUpdateFields(index, {
        image_url: data.url,
        image_public_id: data.public_id,
      });

      toast.success("Desktop banner uploaded! Click 'Save & Publish' below to publish.", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error("Failed to upload desktop banner", { id: toastId, description: msg });
    } finally {
      e.target.value = "";
    }
  };

  // Save and publish to database
  const handleSaveAndPublish = async () => {
    // Validation
    const activeSlides = slides.filter((s) => s.is_active);
    for (let i = 0; i < activeSlides.length; i++) {
      const s = activeSlides[i];
      if (!s.image_url) {
        toast.error(`Slide "${s.title || `#${i + 1}`}" is active but missing a desktop image.`, {
          description: "Please upload an image or deactivate the slide before publishing.",
        });
        return;
      }
      if (!s.title.trim()) {
        toast.error(`Slide #${i + 1} is missing a headline title.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await saveHeroSlides(slides);
      toast.success("Hero Slides Successfully Published!", {
        description: "Your hero slider changes (desktop & mobile banners) are now live on the storefront.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publish failed";
      toast.error("Failed to publish hero slides", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-12 border border-stone-200 text-center">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-800 mb-2" />
        <p className="text-xs text-stone-500 font-medium">Loading hero slides from database...</p>
      </div>
    );
  }

  const activeCount = slides.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-medium text-stone-900">
              Hero Slider Slides
            </h2>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
              {slides.length} {slides.length === 1 ? "Slide" : "Slides"}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              {activeCount} Active Live
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage desktop banners, dedicated mobile banners, headlines, order, and publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {slides.length === 0 && (
            <button
              type="button"
              onClick={handleSeedSamples}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/70 px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>Load Sample Decor Slides</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddSlide}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-stone-700" />
            <span>Add Slide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={slides.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-stone-700" />
            <span>Preview Slider</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2 text-xs font-semibold text-white uppercase tracking-wider hover:bg-stone-800 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isSaving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Empty State when 0 slides */}
      {slides.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 mb-3">
            <Sliders className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-base font-medium text-stone-900">
            No Hero Slides Added Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
            Your storefront hero section currently displays the empty state. Add custom slides or load sample luxury decor templates to get started.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleSeedSamples}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-900 transition shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load 3 Sample Decor Slides</span>
            </button>
            <button
              type="button"
              onClick={handleAddSlide}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Empty Slide</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide Cards List */}
      <div className="space-y-5">
        {slides.map((slide, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`rounded-2xl bg-white border p-5 shadow-2xs transition-all duration-200 ${
                isDragging ? "opacity-40 scale-[0.99] border-dashed border-stone-400" : ""
              } ${isOver ? "border-amber-600 ring-2 ring-amber-500/20" : "border-stone-200"} ${
                !slide.is_active ? "bg-stone-50/60" : ""
              }`}
            >
              {/* Slide Card Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 gap-3">
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div
                    title="Drag to reorder"
                    className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700 p-1"
                  >
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Position Badge */}
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-stone-900 text-white text-[11px] font-semibold">
                    {index + 1}
                  </span>

                  <div>
                    <h4 className="font-serif text-sm font-medium text-stone-900 line-clamp-1">
                      {slide.title || "Untitled Slide"}
                    </h4>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                      Slide ID: {slide.id.slice(0, 12)}
                    </span>
                  </div>
                </div>

                {/* Status Toggle & Reorder Buttons */}
                <div className="flex items-center gap-2">
                  {/* Move Up/Down Buttons */}
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 hover:bg-stone-100 transition cursor-pointer"
                      title="Move slide up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-stone-200" />
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 hover:bg-stone-100 transition cursor-pointer"
                      title="Move slide down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Active / Inactive Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(index)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      slide.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-stone-100 text-stone-500 border border-stone-200"
                    }`}
                  >
                    {slide.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-stone-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Slide Card Body: Form (left) & Image Uploads (right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Fields: 6 cols */}
                <div className="lg:col-span-6 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Eyebrow Subtitle (Clean Text)
                      </label>
                      <input
                        type="text"
                        value={slide.badge || ""}
                        placeholder="PREMIUM HOME DÉCOR"
                        onChange={(e) => handleUpdateField(index, "badge", e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Main Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={slide.title}
                        placeholder="Make Every Corner Feel Beautiful."
                        onChange={(e) => handleUpdateField(index, "title", e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-serif focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Description / Narrative Text
                    </label>
                    <textarea
                      rows={2}
                      value={slide.description}
                      placeholder="Discover carefully selected décor pieces..."
                      onChange={(e) => handleUpdateField(index, "description", e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs leading-relaxed focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>

                  {/* CTA Buttons Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 p-3 rounded-xl bg-stone-50/80 border border-stone-200/70">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Primary CTA
                      </span>
                      <input
                        type="text"
                        placeholder="Label (e.g. Shop Collection)"
                        value={slide.cta_primary_text || ""}
                        onChange={(e) => handleUpdateField(index, "cta_primary_text", e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Link (e.g. /shop)"
                        value={slide.cta_primary_link || ""}
                        onChange={(e) => handleUpdateField(index, "cta_primary_link", e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-600"
                      />
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-stone-50/80 border border-stone-200/70">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Secondary CTA
                      </span>
                      <input
                        type="text"
                        placeholder="Label (e.g. Our Story)"
                        value={slide.cta_secondary_text || ""}
                        onChange={(e) => handleUpdateField(index, "cta_secondary_text", e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Link (e.g. /about)"
                        value={slide.cta_secondary_link || ""}
                        onChange={(e) => handleUpdateField(index, "cta_secondary_link", e.target.value)}
                        className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Uploads: 6 cols (Desktop Banner + Mobile Banner) */}
                <div className="lg:col-span-6 space-y-4">
                  {/* 1. Desktop Banner Upload */}
                  <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-stone-700" />
                        <label className="text-[11px] font-semibold text-stone-800">
                          Desktop Banner (Landscape) *
                        </label>
                      </div>

                      {/* Direct One-Click Desktop Upload Button */}
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-medium hover:bg-stone-800 transition shadow-2xs">
                        <UploadCloud className="h-3 w-3" />
                        <span>{slide.image_url ? "Replace Photo" : "Upload Photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDirectUploadDesktop(index, e)}
                        />
                      </label>
                    </div>

                    <CloudinaryUploader
                      images={
                        slide.image_url
                          ? [
                              {
                                url: slide.image_url,
                                public_id: slide.image_public_id || `hero_desk_${slide.id}`,
                              },
                            ]
                          : []
                      }
                      onChange={(imgs) => {
                        handleUpdateFields(index, {
                          image_url: imgs[0]?.url || "",
                          image_public_id: imgs[0]?.public_id || "",
                        });
                      }}
                      maxImages={1}
                      isProduct={false}
                      folder="lumero/hero"
                    />

                    <input
                      type="url"
                      placeholder="Or paste desktop image URL (https://...)"
                      value={slide.image_url}
                      onChange={(e) => handleUpdateField(index, "image_url", e.target.value)}
                      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[11px] text-stone-600 focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>

                  {/* 2. Mobile Banner Upload Option */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-amber-800" />
                        <label className="text-[11px] font-semibold text-amber-950">
                          Mobile View Banner (Portrait Crop)
                        </label>
                        <span className="text-[9px] font-medium text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          Mobile Specific
                        </span>
                      </div>

                      {/* Direct One-Click Mobile Upload Button */}
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-800 text-white text-[11px] font-medium hover:bg-amber-900 transition shadow-2xs">
                        <UploadCloud className="h-3 w-3" />
                        <span>{slide.mobile_image_url ? "Replace Mobile" : "Upload Mobile"}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          className="hidden"
                          onChange={(e) => handleDirectUploadMobile(index, e)}
                        />
                      </label>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-tight">
                      Upload a vertical/portrait photo (e.g. 4:5 or 9:16) optimized for smartphones. If empty, the desktop image will be displayed.
                    </p>

                    <CloudinaryUploader
                      images={
                        slide.mobile_image_url
                          ? [
                              {
                                url: slide.mobile_image_url,
                                public_id:
                                  slide.mobile_image_public_id || `hero_mob_${slide.id}`,
                              },
                            ]
                          : []
                      }
                      onChange={(imgs) => {
                        handleUpdateFields(index, {
                          mobile_image_url: imgs[0]?.url || "",
                          mobile_image_public_id: imgs[0]?.public_id || "",
                        });
                      }}
                      maxImages={1}
                      isProduct={false}
                      folder="lumero/hero-mobile"
                    />

                    <input
                      type="url"
                      placeholder="Or paste mobile image URL (https://...)"
                      value={slide.mobile_image_url || ""}
                      onChange={(e) =>
                        handleUpdateFields(index, {
                          mobile_image_url: e.target.value,
                          mobile_image_public_id: "",
                        })
                      }
                      className="w-full rounded-lg border border-amber-200/80 bg-white px-3 py-1.5 text-[11px] text-stone-600 focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button at Bottom */}
      {slides.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-stone-950 px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? "Publishing to Storefront..." : "Save and Publish Hero Slides"}</span>
          </button>
        </div>
      )}

      {/* INTERACTIVE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <Eye className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-serif text-base font-medium text-stone-950">
                    Hero Slider Live Preview
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Previewing {slides.filter((s) => s.is_active).length} active slides before publishing.
                  </p>
                </div>
              </div>

              {/* Viewport switch & Close */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex rounded-xl bg-stone-100 p-1 border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                      previewViewport === "desktop"
                        ? "bg-white text-stone-950 font-semibold shadow-xs"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition cursor-pointer ${
                      previewViewport === "mobile"
                        ? "bg-white text-stone-950 font-semibold shadow-xs"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 bg-[#FAF8F5] flex-1 flex flex-col items-center justify-center">
              <div
                className={`w-full transition-all duration-300 ${
                  previewViewport === "mobile"
                    ? "max-w-md border-8 border-stone-800 rounded-3xl overflow-hidden shadow-2xl bg-white p-2"
                    : "max-w-6xl"
                }`}
              >
                <HeroSection
                  slides={slides.filter((s) => s.is_active)}
                  isLoading={false}
                  isPreview={true}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4">
              <span className="text-xs text-stone-500">
                Notice: Changes shown here will only be visible to customers once you click &quot;Save &amp; Publish&quot;.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsPreviewOpen(false);
                    await handleSaveAndPublish();
                  }}
                  className="rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold text-white uppercase tracking-wider hover:bg-stone-800 transition shadow-md cursor-pointer"
                >
                  Publish Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
