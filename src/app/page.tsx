"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, getCategories, getHomeCMS } from "@/lib/store";
import { Product, Category, CMSHomeContent } from "@/types";
import { initialHomeCMS } from "@/lib/mockData";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<CMSHomeContent>(initialHomeCMS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProducts, loadedCategories, loadedCms] = await Promise.all([
          getProducts(),
          getCategories(),
          getHomeCMS(),
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setCms(loadedCms || initialHomeCMS);
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter((p) => p.is_featured);
  const displayProducts =
    activeCategory === "all"
      ? (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8))
      : products.filter((p) => p.category_id === activeCategory);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION (Matches client layout with $25k luxury editorial refinement) */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-100/90 border border-stone-200/80 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-700">
                <Sparkles className="h-3 w-3 text-amber-700" />
                <span>{cms.hero_badge || "PREMIUM HOME DÉCOR"}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-stone-950 leading-[1.12]">
                {cms.hero_title || "Make Every Corner Feel Beautiful."}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-light">
                {cms.hero_subtitle ||
                  "Discover carefully selected décor pieces that transform ordinary rooms into elegant living spaces. Modern, minimal and made to last."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={cms.cta_primary_link || "/shop"}
                  className="rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold tracking-wider text-white uppercase transition hover:bg-stone-800 shadow-md flex items-center gap-2 group"
                >
                  <span>{cms.cta_primary_text || "Shop Collection"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href={cms.cta_secondary_link || "/about"}
                  className="rounded-full border border-stone-300 bg-white/80 px-8 py-3.5 text-xs font-semibold tracking-wider text-stone-800 uppercase transition hover:bg-white hover:border-stone-500 shadow-xs"
                >
                  {cms.cta_secondary_text || "Explore"}
                </Link>
              </div>

              {/* Trust Micro-bar */}
              <div className="pt-4 flex items-center gap-6 text-xs text-stone-500 border-t border-stone-200/60 max-w-md">
                <div>
                  <span className="font-semibold text-stone-900 block text-sm">4.9 / 5</span>
                  <span className="text-[11px]">Client Rating</span>
                </div>
                <div className="h-6 w-px bg-stone-200" />
                <div>
                  <span className="font-semibold text-stone-900 block text-sm">Pan-India</span>
                  <span className="text-[11px]">Insured Delivery</span>
                </div>
                <div className="h-6 w-px bg-stone-200" />
                <div>
                  <span className="font-semibold text-stone-900 block text-sm">100% Original</span>
                  <span className="text-[11px]">Authentic Craft</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Floating Visual Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto aspect-4/3 w-full max-w-lg lg:max-w-none overflow-hidden rounded-3xl bg-stone-200 p-2 shadow-2xl border border-stone-200/90">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src={cms.hero_image || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop"}
                    alt="Lumero Interior Space"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                  {/* Floating Content Card overlay */}
                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md p-5 border border-white/60 shadow-lg">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800">
                      LUMERO LIVING
                    </span>
                    <h3 className="mt-0.5 font-serif text-lg font-medium text-stone-950">
                      {cms.hero_floating_badge_title || "Elevate Your Everyday Space"}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 line-clamp-1">
                      {cms.hero_floating_badge_desc || "Modern aesthetics tailored for peaceful, serene living."}
                    </p>
                    <Link
                      href="/shop"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-950 hover:underline"
                    >
                      <span>Explore Catalog</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            Curated Spaces
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950">
            Shop by Category
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Explore objects organized by room atmosphere and functionality.
          </p>
        </div>

        {/* 6 Category Pills / Cards (matching the client screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-2xs transition hover:border-stone-400 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] text-2xl group-hover:scale-110 transition duration-300">
                {cat.icon || "✨"}
              </div>
              <h3 className="mt-3 font-serif text-sm font-medium text-stone-900 group-hover:text-stone-950">
                {cat.name}
              </h3>
              <span className="mt-0.5 text-[10px] text-stone-400">
                Explore items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              Handpicked Essentials
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-stone-950">
              Featured Products
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
                activeCategory === "all"
                  ? "bg-stone-950 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              All Pieces
            </button>
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
                  activeCategory === c.id
                    ? "bg-stone-950 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-3/4 rounded-2xl bg-stone-200/60 animate-pulse" />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-stone-200">
            <p className="font-serif text-stone-600">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-stone-950 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-stone-950 hover:bg-stone-950 hover:text-white transition"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* WHY CHOOSE LUMERO SECTION (Matches user image) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            The LUMERO Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950">
            Why Choose Lumero
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(cms.features || initialHomeCMS.features).map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center rounded-2xl border border-stone-200/80 bg-white p-6 text-center shadow-2xs hover:shadow-md transition"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="font-serif text-base font-medium text-stone-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
