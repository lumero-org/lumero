"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Heart, Sparkles } from "lucide-react";
import { getAboutCMS, getWhyChooseSection } from "@/lib/store";
import { CMSAboutContent, WhyChooseSection } from "@/types";
import { initialAboutCMS } from "@/lib/mockData";
import { WhyChooseLumero } from "@/components/about/WhyChooseLumero";

export default function AboutPage() {
  const [cms, setCms] = useState<CMSAboutContent>(initialAboutCMS);
  const [whyChooseData, setWhyChooseData] = useState<WhyChooseSection | null>(null);
  const [isLoadingWhyChoose, setIsLoadingWhyChoose] = useState(true);

  useEffect(() => {
    getAboutCMS().then((content) => {
      if (content) setCms(content);
    });

    getWhyChooseSection()
      .then((data) => {
        setWhyChooseData(data);
      })
      .finally(() => {
        setIsLoadingWhyChoose(false);
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
      <section className="relative pt-8 pb-10 sm:pt-14 sm:pb-16 overflow-hidden border-b border-stone-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {cms.badge || "OUR STORY"}
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-950 tracking-tight">
            {cms.headline || "Modern spaces. Better living."}
          </h1>

          <p className="font-serif text-sm sm:text-base text-stone-600 font-light italic max-w-xl mx-auto">
            &quot;{cms.subheadline || "At LUMERO, we believe that the spaces we live in should reflect who we are."}&quot;
          </p>
        </div>
      </section>

      {/* Narrative & Visual Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Brand Photo (Reduced & restrained size) */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-square sm:aspect-4/5 max-w-md mx-auto max-h-[380px] sm:max-h-[440px] w-full overflow-hidden rounded-3xl bg-stone-200 shadow-lg border border-stone-200">
              <Image
                src={
                  cms.banner_image ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop"
                }
                alt="LUMERO Living Space"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-stone-900/10" />
            </div>

            {/* Architectural caption pill */}
            <div className="absolute -bottom-4 -right-2 hidden sm:block max-w-xs rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-stone-200 shadow-lg">
              <p className="font-serif text-[11px] italic text-stone-800">
                &quot;Details aren&apos;t just details. They make the design.&quot;
              </p>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wider text-amber-800">
                Lumero Design Studio
              </span>
            </div>
          </div>

          {/* Narrative Content (Reduced typography scale) */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 block">
              The Vision Behind LUMERO
            </span>

            <div className="space-y-3 text-stone-600 leading-relaxed font-light text-xs sm:text-sm">
              {cms.story_paragraphs?.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200">
              <h4 className="font-serif text-sm sm:text-base font-medium text-stone-950">
                {cms.vision_title || "Thoughtful Form. Everyday Soul."}
              </h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-light">
                {cms.vision_text ||
                  "We curate designs where gentle tactile textures meet quiet geometry. Every item in our catalog is engineered to bring visual calm and functional satisfaction to modern living."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Grid (4 pillars) */}
      <section className="bg-white border-y border-stone-200 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-1.5 mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Guiding Principles
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-950">
              Our Philosophy
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Four timeless cornerstones behind every piece we create and select.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(cms.philosophy_items || initialAboutCMS.philosophy_items).map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-5 shadow-2xs hover:shadow-md transition hover:border-stone-400"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-2xs mb-3">
                  {philosophyIcons[idx % philosophyIcons.length]}
                </div>
                <h3 className="font-serif text-sm sm:text-base font-medium text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE LUMERO SECTION (Relocated to About page with premium accordion & featured image) */}
      <WhyChooseLumero data={whyChooseData} isLoading={isLoadingWhyChoose} />

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
