"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { OfferSection } from "@/components/home/OfferSection";
import {
  getProducts,
  getCategories,
  getHeroSlides,
  getOfferBanner,
} from "@/lib/store";
import { Product, Category, HeroSlide, OfferBannerContent } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [offerBanner, setOfferBanner] = useState<OfferBannerContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroLoading, setIsHeroLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch hero slides independently and immediately so Hero Section renders and transitions without delay
    getHeroSlides()
      .then((slides) => {
        if (slides && slides.length > 0) {
          setHeroSlides(slides);
        }
      })
      .catch((e) => console.error("Failed to load hero slides:", e))
      .finally(() => setIsHeroLoading(false));

    // 2. Fetch all other catalog and CMS data in parallel
    async function loadData() {
      try {
        const [loadedProducts, loadedCategories, loadedOffer] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getOfferBanner(),
          ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setOfferBanner(loadedOffer);
      } catch (e) {
        console.error("Failed to load home data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Featured Products: Exactly max 4 products dynamically from database
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);

  // All Products Section: Max 8 products dynamically from database
  const allProductsPreview = products.slice(0, 8);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION & SLIDER (Dynamically loaded from database) */}
      <HeroSection slides={heroSlides} isLoading={isHeroLoading} />

      {/* 2. SHOP BY CATEGORY SECTION */}
      {/* Requirement: 3-column grid on desktop, 2-column grid on mobile, purely dynamic from DB */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center animate-pulse space-y-3">
                <div className="w-full aspect-[4/3] rounded-2xl bg-stone-200/70" />
                <div className="h-5 w-28 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State - No mock data fallback */
          <div className="rounded-2xl border border-dashed border-stone-200 bg-[#FAF8F5] p-8 text-center text-xs text-stone-500 max-w-md mx-auto">
            No categories configured in database yet.
          </div>
        ) : (
          /* Dynamic Category Cards: 3-col Desktop, 2-col Mobile */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center text-center transition duration-300 hover:-translate-y-1.5"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#F5F1EB] shadow-xs group-hover:shadow-md transition duration-300 border border-stone-200/60">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400">
                      <span className="font-serif text-3xl font-light text-stone-600">
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="mt-3.5 font-serif text-base sm:text-lg font-medium text-stone-900 group-hover:text-amber-900 line-clamp-1 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      {/* Requirement: Display ONLY 4 featured products, fetched dynamically from database */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              Handpicked Essentials
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-stone-950">
              Featured Products
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition group"
          >
            <span>Explore All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Featured Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-square sm:aspect-4/5 rounded-2xl bg-stone-200/80 border border-stone-200/50" />
                <div className="space-y-1.5 px-1">
                  <div className="h-3 w-16 bg-stone-200 rounded-full" />
                  <div className="h-4 w-3/4 bg-stone-200 rounded" />
                  <div className="h-3.5 w-1/3 bg-stone-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-white border border-stone-200/80 p-6">
            <Sparkles className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="font-serif text-stone-700 text-sm">
              No featured products selected in database yet.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Mark products as featured in the Admin Products panel to feature them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. OFFER SECTION */}
      {/* Requirement: Positioned immediately below Featured Products, managed from Admin CMS */}
      <OfferSection offer={offerBanner} isLoading={isLoading} />

      {/* 5. NEW ALL PRODUCTS SECTION */}
      {/* Requirement: Positioned at the bottom of the Offer Section, 4-col desktop, max 8 products, View All -> /shop */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              The Full Catalog
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-stone-950">
              All Products
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Handcrafted stoneware, sculpted architectural objects, and serene accents.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-950 transition group"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-column product grid, max 8 items */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-square sm:aspect-4/5 rounded-2xl bg-stone-200/80 border border-stone-200/50" />
                <div className="space-y-1.5 px-1">
                  <div className="h-3 w-16 bg-stone-200 rounded-full" />
                  <div className="h-4 w-3/4 bg-stone-200 rounded" />
                  <div className="h-3.5 w-1/3 bg-stone-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : allProductsPreview.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-stone-200">
            <p className="font-serif text-stone-600">No products available in the database yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allProductsPreview.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-950 hover:bg-stone-950 hover:text-white transition duration-300 shadow-xs"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
