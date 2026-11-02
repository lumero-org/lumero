"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, getCategories } from "@/lib/store";
import { Product, Category } from "@/types";
import { Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([getProducts(), getCategories()]);
        setProducts(p);
        setCategories(c);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Filter products
  const filteredProducts = products.filter((item) => {
    // Category filter
    if (selectedCategory !== "all") {
      const matchSlug = item.category_id === selectedCategory || item.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
      if (!matchSlug) return false;
    }

    // In stock filter
    if (inStockOnly && item.stock_quantity <= 0) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "stock") return b.stock_quantity - a.stock_quantity;
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Title & Banner */}
      <div className="mb-10 text-center sm:text-left border-b border-stone-200 pb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
          The Curated Catalog
        </span>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-stone-950">
          Interior Objects & Home Décor
        </h1>
        <p className="mt-2 text-sm text-stone-500 max-w-2xl font-light">
          Sculpted ceramics, natural travertine stone, ambient architectural lighting and minimal tactile accents for modern spaces.
        </p>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
              selectedCategory === "all"
                ? "bg-stone-950 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Collections ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
                selectedCategory === c.slug
                  ? "bg-stone-950 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Right Controls: In-stock toggle & Sort dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span>In Stock Only</span>
          </label>

          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-stone-800 outline-hidden cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search status if query active */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-stone-100 px-4 py-2.5 text-xs text-stone-700">
          <span>
            Search results for: <strong className="font-semibold text-stone-900">&quot;{searchQuery}&quot;</strong>
          </span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-stone-500 hover:text-stone-900 underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-3/4 rounded-2xl bg-stone-200/60 animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white border border-stone-200 p-8">
          <SlidersHorizontal className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-medium text-stone-900">
            No matching pieces found
          </h3>
          <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">
            Try adjusting your category filter or search terms to explore other items.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setInStockOnly(false);
            }}
            className="mt-5 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-stone-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-stone-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}

