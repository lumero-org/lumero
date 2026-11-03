"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sliders } from "lucide-react";
import { HeroSlide } from "@/types";

interface HeroSectionProps {
  slides: HeroSlide[];
  isLoading?: boolean;
  isPreview?: boolean;
}

export function HeroSection({
  slides,
  isLoading = false,
  isPreview = false,
}: HeroSectionProps) {
  // Only display active slides on live storefront, or all slides in preview if flagged
  const displaySlides = isPreview
    ? slides
    : slides.filter((s) => s.is_active);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide effect (sliding right-to-left)
  useEffect(() => {
    if (displaySlides.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displaySlides.length, isHovered, currentIndex]);

  // Reset index if slides change and index is out of bounds
  useEffect(() => {
    if (currentIndex >= displaySlides.length && displaySlides.length > 0) {
      setCurrentIndex(0);
    }
  }, [displaySlides.length, currentIndex]);

  // 1. LOADING SKELETON STATE
  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div
          className="lg:rounded-2xl lg:bg-[#F5F1EB] lg:p-14 xl:lg:p-16 lg:border lg:border-stone-200/60 animate-pulse bg-transparent p-0 border-0"
          style={{ borderRadius: "1rem" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column Skeleton (Hidden on Mobile View) */}
            <div className="hidden lg:block lg:col-span-6 space-y-6">
              <div className="h-4 w-36 bg-stone-300/60 rounded" />
              <div className="space-y-3">
                <div className="h-10 sm:h-12 w-4/5 bg-stone-300/60 rounded-lg" />
                <div className="h-10 sm:h-12 w-3/5 bg-stone-300/60 rounded-lg" />
              </div>
              <div className="space-y-2 max-w-md pt-1">
                <div className="h-4 w-full bg-stone-300/50 rounded" />
                <div className="h-4 w-5/6 bg-stone-300/50 rounded" />
              </div>
              <div className="flex gap-4 pt-3">
                <div className="h-11 w-40 bg-stone-300/60 rounded-full" />
                <div className="h-11 w-32 bg-stone-300/40 rounded-full" />
              </div>
            </div>

            {/* Right Column Skeleton (Full height on mobile) */}
            <div className="w-full lg:col-span-6">
              <div
                className="h-[480px] sm:h-[540px] lg:h-auto lg:aspect-4/3 w-full rounded-2xl bg-stone-300/60"
                style={{ borderRadius: "1rem" }}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. EMPTY STATE (When no hero slides are configured)
  if (displaySlides.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div
          className="rounded-2xl bg-[#F5F1EB] p-8 sm:p-14 lg:p-20 text-center border border-stone-200/60 shadow-xs"
          style={{ borderRadius: "1rem" }}
        >
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-200/80 text-stone-600">
              <Sliders className="h-6 w-6 text-stone-600" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
              No Hero Slides Configured
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Hero slides have not been published yet. Please configure and publish your hero slides in the Admin CMS to showcase your collections.
            </p>
            <div className="pt-3">
              <Link
                href="/admin/cms"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase hover:bg-stone-800 transition shadow-md"
              >
                <span>Open Hero Section CMS</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = displaySlides[currentIndex] || displaySlides[0];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Main Hero Container:
          - MOBILE: Outside box is HIDDEN (bg-transparent, p-0, no border, no shadow)
          - DESKTOP: Rounded-2xl with warm luxury theme background, padding and border
      */}
      <div
        className="bg-transparent p-0 border-0 shadow-none lg:rounded-2xl lg:bg-[#F5F1EB] lg:p-12 xl:lg:p-16 lg:border lg:border-stone-200/60 lg:shadow-xs relative overflow-hidden"
        style={{ borderRadius: "1rem" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Narrative & Dynamic Slide Content
              - HIDDEN on Mobile View
              - Visible only on Desktop (lg:block)
          */}
          <div className="hidden lg:block lg:col-span-6 space-y-6">
            {/* Subtitle / Eyebrow Tag: Simple, clean text without sparkles, background, or border */}
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
              {currentSlide.badge || "PREMIUM HOME DÉCOR"}
            </p>

            {/* Main Title / Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal tracking-tight text-stone-950 leading-[1.14] transition-all duration-300">
              {currentSlide.title}
            </h1>

            {/* Description Text: Reduced font size for cleaner visual hierarchy */}
            <p className="text-sm sm:text-[15px] text-stone-600 leading-relaxed max-w-xl font-normal transition-all duration-300">
              {currentSlide.description}
            </p>

            {/* Desktop CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {currentSlide.cta_primary_text && (
                <Link
                  href={currentSlide.cta_primary_link || "/shop"}
                  className="rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold tracking-wider text-white uppercase transition hover:bg-stone-800 shadow-md flex items-center gap-2 group"
                >
                  <span>{currentSlide.cta_primary_text}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}

              {currentSlide.cta_secondary_text && (
                <Link
                  href={currentSlide.cta_secondary_link || "/about"}
                  className="rounded-full border border-stone-300 bg-white/90 px-8 py-3.5 text-xs font-semibold tracking-wider text-stone-800 uppercase transition hover:bg-white hover:border-stone-500 shadow-xs"
                >
                  {currentSlide.cta_secondary_text}
                </Link>
              )}
            </div>

            {/* Trust Micro-bar */}
            <div className="pt-4 flex items-center gap-6 text-xs text-stone-500 border-t border-stone-200/80 max-w-md">
              <div>
                <span className="font-semibold text-stone-900 block text-sm">4.9 / 5</span>
                <span className="text-[11px]">Client Rating</span>
              </div>
              <div className="h-6 w-px bg-stone-300/70" />
              <div>
                <span className="font-semibold text-stone-900 block text-sm">Pan-India</span>
                <span className="text-[11px]">Insured Delivery</span>
              </div>
              <div className="h-6 w-px bg-stone-300/70" />
              <div>
                <span className="font-semibold text-stone-900 block text-sm">100% Original</span>
                <span className="text-[11px]">Authentic Craft</span>
              </div>
            </div>
          </div>

          {/* Right Column / Mobile Hero Image Container:
              - Mobile: Increased height (h-[480px] sm:h-[540px]), border-radius: 2xl
              - Desktop: aspect-4/3
          */}
          <div className="w-full lg:col-span-6">
            <div
              className="relative mx-auto h-[480px] sm:h-[540px] lg:h-auto lg:aspect-4/3 w-full overflow-hidden rounded-2xl shadow-xl bg-stone-200"
              style={{ borderRadius: "1rem" }}
            >
              {/* SLIDING ANIMATION RIGHT-TO-LEFT:
                  Horizontal track shifting translateX(-${currentIndex * 100}%)
              */}
              <div
                className="flex h-full w-full transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {displaySlides.map((slide, index) => {
                  const hasMobileBanner = Boolean(
                    slide.mobile_image_url && slide.mobile_image_url.trim().length > 0
                  );

                  return (
                    <div
                      key={slide.id || index}
                      className="relative min-w-full h-full flex-shrink-0 rounded-2xl overflow-hidden"
                      style={{ borderRadius: "1rem" }}
                    >
                      {/* DESKTOP BANNER: Displayed on desktop (or on both if no mobile banner is configured) */}
                      <Image
                        src={slide.image_url}
                        alt={slide.title || "Lumero Interior Decor"}
                        fill
                        priority={index === 0}
                        quality={95}
                        className={`object-cover rounded-2xl ${
                          hasMobileBanner ? "hidden lg:block" : ""
                        }`}
                        style={{ borderRadius: "1rem" }}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />

                      {/* DEDICATED MOBILE BANNER: Displayed on mobile screens when uploaded */}
                      {hasMobileBanner && (
                        <Image
                          src={slide.mobile_image_url!}
                          alt={`${slide.title || "Lumero Decor"} Mobile Banner`}
                          fill
                          priority={index === 0}
                          quality={95}
                          className="object-cover rounded-2xl lg:hidden"
                          style={{ borderRadius: "1rem" }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MOBILE GRADIENT OVERLAY:
                  Positioned strictly at the bottom (h-48) to keep 75% of the mobile banner 100% bright,
                  vibrant, and crystal-clear while ensuring the bottom headline & CTA stay legible.
              */}
              <div className="lg:hidden absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-transparent pointer-events-none rounded-b-2xl" />

              {/* MOBILE VIEW ONLY:
                  MAIN HEADING & "SHOP NOW" BUTTON AT BOTTOM CENTER
              */}
              <div className="lg:hidden absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-center gap-3.5 w-full px-6 max-w-sm">
                {/* Main Headline */}
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight leading-tight drop-shadow-md">
                  {currentSlide.title}
                </h2>

                {/* Shop Now Button (White background, black text, compact pill width) */}
                <Link
                  href={currentSlide.cta_primary_link || "/shop"}
                  className="w-auto inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold tracking-wider text-black uppercase shadow-xl hover:bg-stone-100 transition active:scale-95"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-3.5 w-3.5 text-black" />
                </Link>
              </div>

              {/* DESKTOP VIEW: Minimal Slide Indicator Bar at bottom-center inside hero image */}
              {displaySlides.length > 1 && (
                <div className="hidden lg:flex absolute bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 z-20 items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/25 backdrop-blur-md">
                  {displaySlides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? "w-8 bg-white shadow-xs"
                          : "w-2.5 bg-white/45 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
