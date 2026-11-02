"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Heart, Sparkles } from "lucide-react";
import { getAboutCMS } from "@/lib/store";
import { CMSAboutContent } from "@/types";
import { initialAboutCMS } from "@/lib/mockData";

export default function AboutPage() {
  const [cms, setCms] = useState<CMSAboutContent>(initialAboutCMS);

  useEffect(() => {
    getAboutCMS().then((content) => {
      if (content) setCms(content);
    });
  }, []);

  const philosophyIcons = [
    <Compass key="1" className="h-6 w-6 text-amber-800" />,
    <Shield key="2" className="h-6 w-6 text-amber-800" />,
    <Heart key="3" className="h-6 w-6 text-amber-800" />,
    <Sparkles key="4" className="h-6 w-6 text-amber-800" />,
  ];

  return (
    <div className="pb-24">
      {/* Editorial Header */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-stone-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {cms.badge || "OUR STORY"}
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-950 tracking-tight">
            {cms.headline || "Modern spaces. Better living."}
          </h1>

          <p className="font-serif text-xl sm:text-2xl text-stone-600 font-light italic max-w-2xl mx-auto">
            &quot;{cms.subheadline || "At LUMERO, we believe that the spaces we live in should reflect who we are."}&quot;
          </p>
        </div>
      </section>

      {/* Narrative & Visual Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Brand Photo */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl bg-stone-200 shadow-xl border border-stone-200">
              <Image
                src={
                  cms.banner_image ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
                }
                alt="LUMERO Living Space"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-stone-900/10" />
            </div>

            {/* Architectural caption pill */}
            <div className="absolute -bottom-6 -right-6 hidden sm:block max-w-xs rounded-2xl bg-white/95 backdrop-blur-md p-5 border border-stone-200 shadow-xl">
              <p className="font-serif text-xs italic text-stone-800">
                &quot;Details aren&apos;t just details. They make the design.&quot;
              </p>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Lumero Design Studio
              </span>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              The Vision Behind LUMERO
            </span>

            <div className="space-y-4 text-stone-700 leading-relaxed font-light text-base sm:text-lg">
              {cms.story_paragraphs?.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200">
              <h4 className="font-serif text-lg font-medium text-stone-950">
                {cms.vision_title || "Thoughtful Form. Everyday Soul."}
              </h4>
              <p className="mt-1 text-sm text-stone-600">
                {cms.vision_text ||
                  "We curate designs where gentle tactile textures meet quiet geometry. Every item in our catalog is engineered to bring visual calm and functional satisfaction to modern living."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Grid (4 pillars from prompt) */}
      <section className="bg-white border-y border-stone-200 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              Guiding Principles
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-950">
              Our Philosophy
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Four timeless cornerstones behind every piece we create and select.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(cms.philosophy_items || initialAboutCMS.philosophy_items).map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-6 shadow-2xs hover:shadow-md transition hover:border-stone-400"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-2xs mb-4">
                  {philosophyIcons[idx % philosophyIcons.length]}
                </div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Statement & CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
          Make Your Space Yours
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-950">
          {cms.closing_tagline || "Make Your Space Yours."}
        </h2>

        <p className="text-sm text-stone-500 max-w-md mx-auto font-light">
          {cms.closing_subtagline || "LUMERO — Modern spaces. Better living."}
        </p>

        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md group"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

