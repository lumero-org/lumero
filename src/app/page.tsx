"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { getProducts, getCategories, getHomeCMS, getHeroSlides } from "@/lib/store";
import { Product, Category, CMSHomeContent, HeroSlide } from "@/types";
import { initialHomeCMS } from "@/lib/mockData";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<CMSHomeContent>(initialHomeCMS);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProducts, loadedCategories, loadedCms, loadedSlides] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getHomeCMS(),
            getHeroSlides(),
          ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setCms(loadedCms || initialHomeCMS);
        setHeroSlides(loadedSlides);
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
      {/* HERO SECTION & SLIDER (Dynamically loaded from database) */}
      <HeroSection slides={heroSlides} isLoading={isLoading} />

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

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center animate-pulse space-y-3">
                <div className="w-full aspect-[3/2] rounded-2xl bg-stone-200/70" />
                <div className="h-5 w-28 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State: No Mock Data Fallback */
          <div className="rounded-2xl border border-dashed border-stone-200 bg-[#FAF8F5] p-8 text-center text-xs text-stone-500 max-w-md mx-auto">
            No categories configured in database yet.
          </div>
        ) : (
          /* Dynamic Category Cards - Enlarged Rectangular Shape */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center text-center transition duration-300 hover:-translate-y-1.5"
              >
                {/* Enlarged Landscape Rectangle Image */}
                <div className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl bg-[#F5F1EB] shadow-xs group-hover:shadow-md transition duration-300">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400">
                      <span className="font-serif text-3xl font-light text-stone-600">
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Name Under Image */}
                <h3 className="mt-3.5 font-serif text-base sm:text-lg font-medium text-stone-900 group-hover:text-stone-950 line-clamp-1 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
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

      {/* WHY CHOOSE LUMERO SECTION */}
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
