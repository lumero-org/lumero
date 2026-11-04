"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, getCategories } from "@/lib/store";
import { Product, Category } from "@/types";
import {
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  X,
  RotateCcw,
  Check,
  PackageSearch,
} from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sortOptions = [
    { value: "featured", label: "Featured First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "stock", label: "Availability" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Featured First";

  // Close custom sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

  const prevParamsRef = useRef({ cat: initialCategory, q: initialQuery });
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const q = searchParams.get("q") || "";
    if (prevParamsRef.current.cat !== cat) {
      prevParamsRef.current.cat = cat;
      setSelectedCategory(cat);
    }
    if (prevParamsRef.current.q !== q) {
      prevParamsRef.current.q = q;
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Extract all unique tags dynamically from actual database products
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [products]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (pricePreset !== "all" || minPrice !== "" || maxPrice !== "") count++;
    if (inStockOnly) count++;
    if (selectedTag !== "all") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [selectedCategory, pricePreset, minPrice, maxPrice, inStockOnly, selectedTag, searchQuery]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setPricePreset("all");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSelectedTag("all");
    setSearchQuery("");
    router.replace("/shop");
  };

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Category filter
      if (selectedCategory !== "all") {
        const matchesCategory =
          item.category_id === selectedCategory ||
          item.slug === selectedCategory ||
          item.category_name?.toLowerCase() === selectedCategory.toLowerCase();
        // Also check category slug match from categories list
        const categoryObj = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        const matchesCatObj = categoryObj && item.category_id === categoryObj.id;
        if (!matchesCategory && !matchesCatObj) return false;
      }

      // 2. Availability filter
      if (inStockOnly && item.stock_quantity <= 0) {
        return false;
      }

      // 3. Price Preset filter
      if (pricePreset !== "all") {
        if (pricePreset === "under-1500" && item.price >= 1500) return false;
        if (pricePreset === "1500-3000" && (item.price < 1500 || item.price > 3000)) return false;
        if (pricePreset === "3000-5000" && (item.price < 3000 || item.price > 5000)) return false;
        if (pricePreset === "above-5000" && item.price <= 5000) return false;
      }

      // Custom Min/Max price inputs
      const minNum = parseFloat(minPrice);
      if (!isNaN(minNum) && item.price < minNum) return false;
      const maxNum = parseFloat(maxPrice);
      if (!isNaN(maxNum) && item.price > maxNum) return false;

      // 4. Tag filter
      if (selectedTag !== "all") {
        if (!item.tags || !item.tags.includes(selectedTag)) return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchCat = item.category_name?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchTag && !matchCat) return false;
      }

      return true;
    });
  }, [products, categories, selectedCategory, inStockOnly, pricePreset, minPrice, maxPrice, selectedTag, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "stock") return b.stock_quantity - a.stock_quantity;
      if (sortBy === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      // "featured" default
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [filteredProducts, sortBy]);

  // Filter controls JSX (Shared between Desktop sidebar & Mobile drawer)
  const filterControlsContent = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-serif text-sm font-medium text-stone-900 uppercase tracking-wider">
          Categories
        </h4>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
              selectedCategory === "all"
                ? "bg-stone-950 text-white font-medium shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <span>All Collections</span>
            <span className="text-[11px] opacity-75">{products.length}</span>
          </button>
          {categories.map((c) => {
            const count = products.filter(
              (p) => p.category_id === c.id || p.category_name?.toLowerCase() === c.name.toLowerCase()
            ).length;
            const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                  isSelected
                    ? "bg-stone-950 text-white font-medium shadow-xs"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[11px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-stone-200/80 space-y-3">
        <h4 className="font-serif text-sm font-medium text-stone-900 uppercase tracking-wider">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "All Prices" },
            { id: "under-1500", label: "Under ₹1,500" },
            { id: "1500-3000", label: "₹1,500 – ₹3,000" },
            { id: "3000-5000", label: "₹3,000 – ₹5,000" },
            { id: "above-5000", label: "Above ₹5,000" },
          ].map((preset) => (
            <label
              key={preset.id}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer text-xs text-stone-700"
            >
              <input
                type="radio"
                name="pricePreset"
                checked={pricePreset === preset.id}
                onChange={() => {
                  setPricePreset(preset.id);
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="h-3.5 w-3.5 text-stone-950 border-stone-300 focus:ring-stone-900"
              />
              <span>{preset.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-semibold text-stone-400 block mb-1.5">
            Custom Range (₹)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPricePreset("custom");
              }}
              className="w-1/2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:border-stone-900 focus:outline-hidden"
            />
            <span className="text-stone-400 text-xs">–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPricePreset("custom");
              }}
              className="w-1/2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:border-stone-900 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Availability / Stock Status Filter */}
      <div className="pt-4 border-t border-stone-200/80 space-y-3">
        <h4 className="font-serif text-sm font-medium text-stone-900 uppercase tracking-wider">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-stone-50 cursor-pointer text-xs text-stone-700 border border-stone-200/60">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded-md border-stone-300 text-stone-950 focus:ring-stone-900"
          />
          <span className="font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Tags Filter (if available) */}
      {allTags.length > 0 && (
        <div className="pt-4 border-t border-stone-200/80 space-y-3">
          <h4 className="font-serif text-sm font-medium text-stone-900 uppercase tracking-wider">
            Material &amp; Style
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTag("all")}
              className={`rounded-full px-3 py-1 text-xs transition ${
                selectedTag === "all"
                  ? "bg-stone-950 text-white font-medium"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? "all" : tag)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  selectedTag === tag
                    ? "bg-stone-950 text-white font-medium"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8 text-left border-b border-stone-200 pb-4 sm:pb-6">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400 block">
          The Curated Catalog
        </span>
        <h1 className="mt-1 font-serif text-xl sm:text-3xl md:text-4xl font-normal text-stone-950 tracking-tight">
          Interior Objects &amp; Home Décor
        </h1>
        <p className="hidden sm:block mt-2 text-xs sm:text-sm text-stone-500 max-w-2xl font-light">
          Sculpted ceramics, natural travertine stone, ambient architectural lighting, and minimal tactile accents for modern spaces.
        </p>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* DESKTOP SIDEBAR (Left Side: Product Filter Sidebar) */}
        <aside className="hidden lg:block w-64 lg:w-72 shrink-0 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-stone-700" />
              <h3 className="font-serif text-base font-medium text-stone-900">
                Filters
              </h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-stone-950 underline transition"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {filterControlsContent}
        </aside>

        {/* RIGHT SIDE: Product Catalog Area */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Top Controls Bar: Mobile filter button & Sort selector on the SAME LINE with EQUAL WIDTH */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Desktop Product Count */}
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-xs font-medium text-stone-500">
                  Showing <strong className="text-stone-900">{sortedProducts.length}</strong> {sortedProducts.length === 1 ? "piece" : "pieces"}
                </span>
              </div>

              {/* Mobile / Tablet Controls: Equal 50/50 width buttons */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto lg:flex lg:items-center">
                {/* Left: Mobile Filter Button (Equal Width) */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 text-white px-3 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition shadow-2xs"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-stone-950">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Right: Custom Styled Sort Dropdown (Equal Width on Mobile) */}
                <div ref={sortRef} className="relative w-full lg:w-56">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    className="w-full h-10 flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50/90 hover:bg-stone-100/90 px-3 text-xs font-medium text-stone-800 transition"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ArrowUpDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{currentSortLabel}</span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isSortOpen ? "rotate-180 text-stone-900" : ""
                      }`}
                    />
                  </button>

                  {/* Proper Luxury UI Dropdown Menu */}
                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-40 w-full sm:w-56 rounded-2xl bg-white p-1.5 shadow-xl border border-stone-200/90 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="space-y-0.5">
                        {sortOptions.map((opt) => {
                          const isSelected = sortBy === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value);
                                setIsSortOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left ${
                                isSelected
                                  ? "bg-stone-900 text-white font-medium shadow-xs"
                                  : "text-stone-700 hover:bg-stone-100 hover:text-stone-950 font-normal"
                              }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filter Pills (Shows beneath only when filters are active) */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                    <span className="truncate max-w-[120px]">{selectedCategory}</span>
                    <button onClick={() => setSelectedCategory("all")} className="hover:text-stone-950">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {pricePreset !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                    <span>Price filtered</span>
                    <button
                      onClick={() => {
                        setPricePreset("all");
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="hover:text-stone-950"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                    <span>In Stock</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:text-stone-950">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {selectedTag !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                    <span>{selectedTag}</span>
                    <button onClick={() => setSelectedTag("all")} className="hover:text-stone-950">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                    <span>&quot;{searchQuery}&quot;</span>
                    <button onClick={() => setSearchQuery("")} className="hover:text-stone-950">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-stone-500 hover:text-stone-900 underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : sortedProducts.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white border border-stone-200 p-8 space-y-4">
              <PackageSearch className="h-10 w-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-medium text-stone-900">
                No matching pieces found
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                We couldn&apos;t find any objects matching your current filter combinations. Try resetting filters to view all products.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET (Slides from Bottom to Top) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[88vh] bg-white rounded-t-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-stone-200">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-stone-900" />
                <h3 className="font-serif text-base font-medium text-stone-900">
                  Refine Catalog
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {filterControlsContent}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                }}
                className="flex-1 rounded-xl border border-stone-200 py-3 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:bg-stone-50 text-center"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-stone-950 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 text-center shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-12 text-center text-stone-400">
          Loading catalog...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
