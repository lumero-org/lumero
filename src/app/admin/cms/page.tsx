"use client";

import React, { useState, useEffect } from "react";
import {
  FileEdit,
  Save,
  Home,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
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
import { toast } from "sonner";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");

  const [homeCMS, setHomeCMS] = useState<CMSHomeContent>(initialHomeCMS);
  const [aboutCMS, setAboutCMS] = useState<CMSAboutContent>(initialAboutCMS);
  const [isSaving, setIsSaving] = useState(false);

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
        description: "Homepage hero, announcement bar and features are now published.",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Content Management System
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Storefront CMS
          </h1>
          <p className="text-xs text-stone-500">
            Live editorial control for the Home and About pages.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-white p-1 border border-stone-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
              activeTab === "home"
                ? "bg-stone-950 text-white shadow-xs font-semibold"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Home Page</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
              activeTab === "about"
                ? "bg-stone-950 text-white shadow-xs font-semibold"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>About Page</span>
          </button>
        </div>
      </div>

      {/* HOME CMS TAB */}
      {activeTab === "home" && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          {/* Announcement Bar */}
          <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              Top Announcement Bar
            </h3>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Banner Message (Appears sticky across all pages)
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

          {/* Hero Section Content */}
          <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              Hero Section Headline & Narrative
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Eyebrow Tag
                </label>
                <input
                  type="text"
                  value={homeCMS.hero_badge}
                  onChange={(e) =>
                    setHomeCMS({ ...homeCMS, hero_badge: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={homeCMS.hero_title}
                  onChange={(e) =>
                    setHomeCMS({ ...homeCMS, hero_title: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Hero Subtext
                </label>
                <textarea
                  rows={2}
                  value={homeCMS.hero_subtitle}
                  onChange={(e) =>
                    setHomeCMS({ ...homeCMS, hero_subtitle: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={homeCMS.cta_primary_text}
                  onChange={(e) =>
                    setHomeCMS({ ...homeCMS, cta_primary_text: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={homeCMS.cta_secondary_text}
                  onChange={(e) =>
                    setHomeCMS({ ...homeCMS, cta_secondary_text: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Hero Image (Uncompressed as required) */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-stone-700 mb-2">
                Hero Showcase Banner (Uploaded to Cloudinary uncompressed)
              </label>
              <CloudinaryUploader
                images={
                  homeCMS.hero_image
                    ? [
                        {
                          url: homeCMS.hero_image,
                          public_id: homeCMS.hero_image_public_id || "hero_image",
                        },
                      ]
                    : []
                }
                onChange={(imgs) => {
                  setHomeCMS({
                    ...homeCMS,
                    hero_image: imgs[0]?.url || "",
                    hero_image_public_id: imgs[0]?.public_id,
                  });
                }}
                maxImages={1}
                isProduct={false}
                folder="lumero/cms"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Home Content"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ABOUT CMS TAB */}
      {activeTab === "about" && (
        <form onSubmit={handleSaveAbout} className="space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              About Page Narrative & Vision
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
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
                <label className="block text-xs font-medium text-stone-700 mb-1">
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
              <label className="block text-xs font-medium text-stone-700">
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

            {/* About Banner Photo (Uncompressed) */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-stone-700 mb-2">
                Brand Banner Photo (Cloudinary upload without compression)
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
          <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-medium text-stone-900">
              The 4 Philosophy Pillars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aboutCMS.philosophy_items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-stone-200 p-3.5 bg-stone-50/50 space-y-2">
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
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium"
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
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
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

