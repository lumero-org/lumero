"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Save,
  Home,
  BookOpen,
  Plus,
  Trash2,
  Sliders,
  ArrowRight,
  Megaphone,
  CheckCircle2,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  getHomeCMS,
  saveHomeCMS,
  getAboutCMS,
  saveAboutCMS,
} from "@/lib/store";
import { CMSHomeContent, CMSAboutContent } from "@/types";
import { initialHomeCMS, initialAboutCMS } from "@/lib/mockData";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { HeroSlidesManager } from "@/components/admin/HeroSlidesManager";
import { OfferSectionManager } from "@/components/admin/OfferSectionManager";
import { WhyChooseManager } from "@/components/admin/WhyChooseManager";
import { toast } from "sonner";

const CMS_SECTIONS = [
  {
    id: "hero" as const,
    label: "Hero Slider",
    icon: Sliders,
    description: "Carousel slides, photos, order & timing",
  },
  {
    id: "offer" as const,
    label: "Offer Banner",
    icon: Megaphone,
    description: "Curated living promotional section",
  },
  {
    id: "why-choose" as const,
    label: "Why Choose Lumero",
    icon: CheckCircle2,
    description: "Craftsmanship pillars & brand values",
  },
  {
    id: "home" as const,
    label: "Announcement",
    icon: Home,
    description: "Storefront header announcement bar",
  },
  {
    id: "about" as const,
    label: "About Story",
    icon: BookOpen,
    description: "Brand narrative, quote & vision",
  },
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<
    "hero" | "offer" | "why-choose" | "home" | "about"
  >("hero");

  const [homeCMS, setHomeCMS] = useState<CMSHomeContent>(initialHomeCMS);
  const [aboutCMS, setAboutCMS] = useState<CMSAboutContent>(initialAboutCMS);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function load() {
      const [h, a] = await Promise.all([getHomeCMS(), getAboutCMS()]);
      if (h) setHomeCMS(h);
      if (a) setAboutCMS(a);
    }
    load();
  }, []);

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveHomeCMS(homeCMS);
      toast.success("Home Page Content Updated", {
        description: "Announcement bar and site settings saved.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Failed to save", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveAboutCMS(aboutCMS);
      toast.success("About Page Narrative Updated", {
        description: "LUMERO story, philosophies and vision published.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Failed to save", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Content Management System
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Storefront CMS &amp; Sections
          </h1>
          <p className="text-xs text-stone-500">
            Full dynamic control over the Hero Slider, Promotional Offer Banner, Why Choose Lumero, and Site Narratives.
          </p>
        </div>

        {/* CMS Sections Dropdown Selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          {(() => {
            const currentSection =
              CMS_SECTIONS.find((s) => s.id === activeTab) || CMS_SECTIONS[0];
            const CurrentIcon = currentSection.icon;
            return (
              <>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 border border-stone-200/90 shadow-2xs hover:border-stone-400 transition text-xs text-stone-900 min-w-[240px] justify-between cursor-pointer"
                  aria-expanded={isDropdownOpen}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-xl bg-stone-900 text-white shadow-2xs">
                      <CurrentIcon className="h-4 w-4" />
                    </span>
                    <div className="text-left">
                      <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                        CMS Section
                      </span>
                      <span className="font-serif font-medium text-sm text-stone-950">
                        {currentSection.label}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200/90 shadow-xl p-1.5 z-40 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-amber-800 border-b border-stone-100 mb-1">
                      Choose Section to Edit
                    </div>
                    <div className="space-y-1">
                      {CMS_SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isSelected = activeTab === section.id;
                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(section.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                              isSelected
                                ? "bg-stone-950 text-white font-medium shadow-xs"
                                : "text-stone-700 hover:bg-stone-100/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-stone-100 text-stone-700"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <span className="block text-xs font-serif truncate">
                                  {section.label}
                                </span>
                                <span
                                  className={`block text-[10px] truncate ${
                                    isSelected ? "text-stone-300" : "text-stone-400"
                                  }`}
                                >
                                  {section.description}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 shrink-0 text-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* 1. HERO SLIDER CMS TAB */}
      {activeTab === "hero" && <HeroSlidesManager />}

      {/* 2. OFFER BANNER CMS TAB */}
      {activeTab === "offer" && <OfferSectionManager />}

      {/* 3. WHY CHOOSE LUMERO CMS TAB */}
      {activeTab === "why-choose" && <WhyChooseManager />}

      {/* 4. ANNOUNCEMENT & SITE CMS TAB */}
      {activeTab === "home" && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          {/* Shop by Category Management Section Link */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Home Page Section
              </span>
              <h3 className="font-serif text-base font-medium text-stone-900 mt-0.5">
                Shop by Category Section
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload category images, customize category names, and manage storefront ordering.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold text-white uppercase tracking-wider hover:bg-stone-800 transition shadow-xs shrink-0"
            >
              <span>Manage Categories &amp; Images</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Announcement Bar */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              Top Announcement Bar
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Banner Message (Appears sticky across all storefront pages)
              </label>
              <input
                type="text"
                value={homeCMS.announcement_bar}
                onChange={(e) =>
                  setHomeCMS({ ...homeCMS, announcement_bar: e.target.value })
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. ABOUT CMS TAB */}
      {activeTab === "about" && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              About Page Narrative &amp; Vision
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  value={aboutCMS.badge}
                  onChange={(e) =>
                    setAboutCMS({ ...aboutCMS, badge: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Main Title
                </label>
                <input
                  type="text"
                  value={aboutCMS.headline}
                  onChange={(e) =>
                    setAboutCMS({ ...aboutCMS, headline: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Subheadline / Quote
                </label>
                <input
                  type="text"
                  value={aboutCMS.subheadline}
                  onChange={(e) =>
                    setAboutCMS({ ...aboutCMS, subheadline: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Story Paragraphs
              </label>
              {aboutCMS.story_paragraphs.map((para, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    rows={2}
                    value={para}
                    onChange={(e) => {
                      const updated = [...aboutCMS.story_paragraphs];
                      updated[i] = e.target.value;
                      setAboutCMS({ ...aboutCMS, story_paragraphs: updated });
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = aboutCMS.story_paragraphs.filter((_, idx) => idx !== i);
                      setAboutCMS({ ...aboutCMS, story_paragraphs: updated });
                    }}
                    className="p-2 text-stone-400 hover:text-rose-600"
                    title="Remove paragraph"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAboutCMS({
                    ...aboutCMS,
                    story_paragraphs: [...aboutCMS.story_paragraphs, ""],
                  });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 font-medium pt-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Paragraph</span>
              </button>
            </div>

            {/* About Banner Photo */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Brand Banner Photo (Cloudinary)
              </label>
              <CloudinaryUploader
                images={
                  aboutCMS.banner_image
                    ? [
                        {
                          url: aboutCMS.banner_image,
                          public_id: aboutCMS.banner_image_public_id || "about_banner",
                        },
                      ]
                    : []
                }
                onChange={(imgs) => {
                  setAboutCMS({
                    ...aboutCMS,
                    banner_image: imgs[0]?.url || "",
                    banner_image_public_id: imgs[0]?.public_id,
                  });
                }}
                maxImages={1}
                isProduct={false}
                folder="lumero/cms"
              />
            </div>
          </div>

          {/* Philosophy Pillars (4 Items) */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              The 4 Philosophy Pillars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aboutCMS.philosophy_items.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-stone-200 p-4 bg-[#FAF8F5]/60 space-y-2">
                  <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                    Pillar #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...aboutCMS.philosophy_items];
                      updated[idx].title = e.target.value;
                      setAboutCMS({ ...aboutCMS, philosophy_items: updated });
                    }}
                    placeholder="Pillar Title"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium"
                  />
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...aboutCMS.philosophy_items];
                      updated[idx].description = e.target.value;
                      setAboutCMS({ ...aboutCMS, philosophy_items: updated });
                    }}
                    placeholder="Description"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save About Content"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
