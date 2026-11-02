"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubscribed(true);
    toast.success("Welcome to the LUMERO Club!", {
      description: "Enjoy 10% off your first handcrafted interior order.",
    });
    setEmail("");
  };

  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-300">
      {/* Newsletter Section */}
      <div className="border-b border-stone-800/80">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400">
              Exclusive Sanctuary
            </span>
            <h3 className="mt-2 text-2xl sm:text-3xl font-serif font-light tracking-wide text-white">
              Join the LUMERO Club
            </h3>
            <p className="mt-3 text-sm text-stone-400 leading-relaxed">
              Be the first to know about new arrivals, private seasonal archive drops, and curated Scandinavian styling inspiration.
            </p>

            {isSubscribed ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-800 px-6 py-3 text-sm text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>You are subscribed. Check your inbox for your welcome privilege!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full bg-stone-900 border border-stone-800 px-5 py-3 text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-full bg-stone-100 hover:bg-white text-stone-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-light tracking-[0.25em] text-white">
              LUMERO
            </span>
            <p className="text-xs text-stone-400 leading-relaxed">
              Modern spaces. Better living. Thoughtfully curated Scandinavian and contemporary home décor designed to inspire serenity and elevate everyday spaces.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                Authentic Craft
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-amber-400" />
                Pan-India Delivery
              </span>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="font-serif text-sm font-medium tracking-wider text-white uppercase mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=wall-decor" className="hover:text-white transition">
                  Wall Décor & Mirrors
                </Link>
              </li>
              <li>
                <Link href="/shop?category=lighting" className="hover:text-white transition">
                  Architectural Lighting
                </Link>
              </li>
              <li>
                <Link href="/shop?category=plants" className="hover:text-white transition">
                  Botanicals & Terracotta
                </Link>
              </li>
              <li>
                <Link href="/shop?category=desk-setup" className="hover:text-white transition">
                  Walnut Desk Objects
                </Link>
              </li>
              <li>
                <Link href="/shop?category=storage" className="hover:text-white transition">
                  Travertine Catchalls
                </Link>
              </li>
              <li>
                <Link href="/shop?category=home-essentials" className="hover:text-white transition">
                  Hand-Poured Candles
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif text-sm font-medium tracking-wider text-white uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About LUMERO
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Customer Concierge
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition font-medium">
                  Admin Portal & CMS
                </Link>
              </li>
              <li>
                <span className="text-stone-500">Shipping Policy</span>
              </li>
              <li>
                <span className="text-stone-500">Returns & Exchanges</span>
              </li>
            </ul>
          </div>

          {/* Customer Assurance */}
          <div>
            <h4 className="font-serif text-sm font-medium tracking-wider text-white uppercase mb-4">
              Assurance
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Every item is packaged in eco-friendly custom molded foam to arrive in flawless condition at your doorstep.
            </p>
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3.5 space-y-2 text-[11px] text-stone-400">
              <div className="flex items-center gap-2 text-stone-300 font-medium">
                <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                <span>7-Day Replacement Guarantee</span>
              </div>
              <p className="text-[10px]">
                Report any transit issue within 7 days for immediate replacement.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-stone-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} LUMERO Décor. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Supabase, Cloudinary & Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

