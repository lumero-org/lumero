"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ArrowRight,
  Loader2,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getHomeCMS, getProducts, getShippingSettings } from "@/lib/store";
import { CustomerAuthModal } from "@/components/auth/CustomerAuthModal";
import { Product, ShippingSettings } from "@/types";

function formatAnnouncement(template?: string, shipping?: ShippingSettings): string {
  const threshold = shipping?.threshold_amount ?? 1999;
  const isThreshold = shipping?.method !== "fixed";

  if (!isThreshold) {
    if (template && !template.includes("1,999") && !template.toLowerCase().includes("orders over")) {
      return template;
    }
    return "Pan-India Express Delivery • Handcrafted with Soul";
  }

  if (template) {
    if (/Orders Over ₹[0-9,]+/i.test(template)) {
      return template.replace(/Orders Over ₹[0-9,]+/i, `Orders Over ₹${threshold.toLocaleString()}`);
    }
    if (/₹1,999/g.test(template)) {
      return template.replace(/₹1,999/g, `₹${threshold.toLocaleString()}`);
    }
    if (/₹[0-9,]+/i.test(template) && template.toLowerCase().includes("orders over")) {
      return template.replace(/₹[0-9,]+/i, `₹${threshold.toLocaleString()}`);
    }
  }

  return `Complimentary Pan-India Express Delivery on Orders Over ₹${threshold.toLocaleString()} • Handcrafted with Soul`;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [announcement, setAnnouncement] = useState(
    "Complimentary Pan-India Express Delivery on Orders Over ₹1,999 • Handcrafted with Soul"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const refreshAnnouncement = async (overrideShipping?: ShippingSettings) => {
      try {
        const [cms, shipping] = await Promise.all([
          getHomeCMS(),
          overrideShipping ? Promise.resolve(overrideShipping) : getShippingSettings(),
        ]);
        if (!isMounted) return;
        setAnnouncement(formatAnnouncement(cms?.announcement_bar, shipping));
      } catch (e) {
        console.warn("Failed to load dynamic announcement:", e);
      }
    };

    refreshAnnouncement();

    const handleShippingEvent = (e?: Event) => {
      const detail = (e && "detail" in e && (e as CustomEvent).detail) as ShippingSettings | undefined;
      refreshAnnouncement(detail);
    };

    window.addEventListener("lumero_shipping_updated", handleShippingEvent);
    window.addEventListener("lumero_catalog_updated", () => refreshAnnouncement());
    window.addEventListener("lumero_settings_updated", () => refreshAnnouncement());

    return () => {
      isMounted = false;
      window.removeEventListener("lumero_shipping_updated", handleShippingEvent);
      window.removeEventListener("lumero_catalog_updated", () => refreshAnnouncement());
      window.removeEventListener("lumero_settings_updated", () => refreshAnnouncement());
    };
  }, []);

  // Pre-load products when search is opened
  useEffect(() => {
    if (!isSearchOpen || allProducts.length > 0) return;
    let isMounted = true;
    getProducts()
      .then((items) => {
        if (isMounted) setAllProducts(items);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSearch(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isSearchOpen, allProducts.length]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Dynamic search filtering
  const matchingProducts = searchQuery.trim()
    ? allProducts.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchCat =
          p.category_name?.toLowerCase().includes(q) ||
          p.category_id?.toLowerCase().includes(q);
        const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
        return matchName || matchDesc || matchCat || matchTag;
      })
    : [];

  const handleSelectProduct = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/products/${slug}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {announcement && (
        <div className="bg-stone-900 text-stone-200 text-xs font-medium tracking-wider overflow-hidden border-b border-stone-800 select-none">
          {/* Mobile View: Continuous right-to-left marquee ticker on the same line */}
          <div className="md:hidden py-2 overflow-hidden flex w-full whitespace-nowrap">
            <div className="flex animate-marquee shrink-0 items-center">
              <span className="mx-4">{announcement}</span>
              <span className="text-stone-500">•</span>
              <span className="mx-4">{announcement}</span>
              <span className="text-stone-500">•</span>
            </div>
            <div className="flex animate-marquee shrink-0 items-center" aria-hidden="true">
              <span className="mx-4">{announcement}</span>
              <span className="text-stone-500">•</span>
              <span className="mx-4">{announcement}</span>
              <span className="text-stone-500">•</span>
            </div>
          </div>

          {/* Desktop View: Centered single line */}
          <div className="hidden md:flex items-center justify-center py-2 px-4 text-center whitespace-nowrap">
            <span>{announcement}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Menu Toggle & Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-950 md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-wide transition-colors ${
                      isActive
                        ? "font-semibold text-stone-900 border-b-2 border-stone-900 pb-0.5"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="group flex flex-col items-center">
              <span className="font-serif text-2xl sm:text-3xl font-light tracking-[0.25em] text-stone-950 transition duration-300 group-hover:opacity-80">
                LUMERO
              </span>
              <span className="text-[9px] tracking-[0.35em] text-stone-500 uppercase -mt-1 font-sans">
                Modern Living
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Account, Cart) - Public navbar clean */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard Tab (Only visible if logged-in user is an Admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
                title="Go to Admin Dashboard"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Search Trigger */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                if (allProducts.length === 0) setIsLoadingSearch(true);
              }}
              className="p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
              aria-label="Search items"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Customer Account / Auth Trigger (Goes to /account if logged in, opens login modal if not) */}
            {user ? (
              <Link
                href="/account"
                className="relative p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
                aria-label="My Account"
                title={`Account: ${user.full_name}`}
              >
                <User className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="relative p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
                aria-label="Sign In / Register"
                title="Sign In / Register"
              >
                <User className="h-5 w-5" />
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center p-2 text-stone-900 hover:text-stone-700 transition rounded-full hover:bg-stone-100"
              aria-label="Cart bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with smooth slide-in animation */}
      <div
        className={`fixed inset-0 z-50 flex md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop Fade */}
        <div
          className={`fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Slide-in Navigation Panel */}
        <div
          className={`relative z-10 w-4/5 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <span className="font-serif text-xl tracking-[0.2em] font-light">LUMERO</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-stone-800 hover:text-stone-950"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-stone-200 space-y-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full py-2 text-stone-900 font-semibold text-base"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {user ? (
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full py-2 text-stone-800 hover:text-stone-950 font-medium text-base"
                >
                  <User className="w-5 h-5 text-stone-600" />
                  <span>My Account ({user.full_name?.split(" ")[0] || "Profile"})</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-3 w-full py-2 text-stone-800 hover:text-stone-950 font-medium text-base"
                >
                  <User className="w-5 h-5 text-stone-600" />
                  <span>Customer Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Premium Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header & Input */}
            <div className="p-4 sm:p-6 border-b border-stone-200/80 bg-[#FAF8F5]/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  Search Catalog
                </span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-full p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3 shadow-2xs focus-within:border-stone-950 focus-within:ring-2 focus-within:ring-stone-950/10 transition">
                  <Search className="h-5 w-5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-sans bg-transparent outline-hidden text-stone-900 placeholder:text-stone-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-stone-400 hover:text-stone-700 text-xs"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100">
              {isLoadingSearch ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
                  <p className="text-xs">Loading Lumero collection...</p>
                </div>
              ) : searchQuery.trim() === "" ? (
                <div className="py-12 text-center space-y-2">
                  <PackageSearch className="h-8 w-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-500 font-light">
                    Type a keyword above to find architectural lighting, sculpted ceramics, travertine, and modern home decor.
                  </p>
                </div>
              ) : matchingProducts.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="font-serif text-base text-stone-900">
                    No products found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try checking your spelling or search for broader terms like &quot;lamp&quot;, &quot;table&quot;, or &quot;decor&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="pb-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
                    {matchingProducts.length} {matchingProducts.length === 1 ? "Product" : "Products"} Found
                  </div>
                  <div className="space-y-1">
                    {matchingProducts.map((product) => {
                      const displayImg = product.images?.[0]?.url;
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSelectProduct(product.slug || product.id)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 transition text-left group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                              {displayImg ? (
                                <Image
                                  src={displayImg}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition duration-300"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-stone-400 font-serif text-lg">
                                  {product.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif text-sm font-medium text-stone-900 group-hover:text-stone-950 truncate">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-stone-500 truncate">
                                {product.category_name || "Home Décor"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="font-sans text-xs font-semibold text-stone-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-0.5 transition" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {searchQuery.trim() !== "" && matchingProducts.length > 0 && (
              <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
                <button
                  onClick={() => handleSearchSubmit()}
                  className="text-xs font-medium text-stone-700 hover:text-stone-950 underline"
                >
                  View all results on Shop page →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Customer Account & Login/Register Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
