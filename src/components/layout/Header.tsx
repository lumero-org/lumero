"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, User, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getHomeCMS } from "@/lib/store";

export function Header() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [announcement, setAnnouncement] = useState(
    "Complimentary Pan-India Express Delivery on Orders Over ₹1,999 • Handcrafted with Soul"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getHomeCMS().then((cms) => {
      if (cms?.announcement_bar) {
        setAnnouncement(cms.announcement_bar);
      }
    });
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      {announcement && (
        <div className="bg-stone-900 px-4 py-2 text-center text-xs font-medium tracking-wider text-stone-200">
          <p className="flex items-center justify-center gap-2">
            <span>{announcement}</span>
          </p>
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

          {/* Right: Actions (Search, Account, Cart) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Panel Link for logged-in admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition"
              >
                <span>Dashboard</span>
              </Link>
            )}

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
              aria-label="Search items"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Account / Auth */}
            <Link
              href={user ? (isAdmin ? "/admin" : "/account") : "/login"}
              className="p-2 text-stone-700 hover:text-stone-950 transition rounded-full hover:bg-stone-100"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center p-2 text-stone-900 hover:text-stone-700 transition"
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between">
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

              {isAdmin && (
                <div className="pt-4 border-t border-stone-100">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-stone-900 p-3 text-sm font-medium text-white"
                  >
                    <span>Admin Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-serif font-medium text-stone-900 mb-4">
              Search Lumero Catalog
            </h3>

            <div className="flex items-center gap-3 rounded-xl border border-stone-300 px-3 py-2.5 focus-within:border-stone-900">
              <Search className="h-5 w-5 text-stone-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search lamps, travertine, wall art, ceramics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="w-full text-sm outline-hidden placeholder:text-stone-400"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
              >
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="text-stone-400">Popular:</span>
              {["Ceramic Lamp", "Travertine Mirror", "Walnut Tray", "Terracotta Pot"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    window.location.href = `/shop?q=${encodeURIComponent(tag)}`;
                  }}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700 hover:bg-stone-200 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

