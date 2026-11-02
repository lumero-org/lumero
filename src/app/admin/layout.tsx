"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  FileEdit,
  Settings,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, login, logout, isLoading } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(adminEmail, adminPassword, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "CMS Editor", href: "/admin/cms", icon: FileEdit },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // If loading session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="font-serif text-sm">Verifying administration session...</span>
        </div>
      </div>
    );
  }

  // DEDICATED PROPER ADMIN LOGIN PORTAL
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 text-stone-100">
        <div className="w-full max-w-md rounded-3xl bg-stone-900 p-8 sm:p-10 border border-stone-800 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-3">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="font-serif text-2xl font-light tracking-[0.25em] text-white block">
              LUMERO
            </span>
            <h1 className="font-serif text-lg font-medium text-stone-200">
              Admin Portal Login
            </h1>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
              Sign in with your administrator credentials to access the store management suite.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@lumero.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-600 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950/70 pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-600 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 py-3 text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                  <span>Verifying Privileges...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-stone-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-white transition"
            >
              <span>← Back to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 text-stone-300 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Logo & Close for mobile */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div>
              <span className="font-serif text-xl font-light tracking-[0.25em] text-white">
                LUMERO
              </span>
              <span className="block text-[9px] font-medium tracking-[0.2em] text-amber-400 uppercase">
                Admin & CMS Suite
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-stone-800 text-white shadow-xs font-semibold border-l-2 border-amber-400"
                      : "text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer of Sidebar */}
        <div className="p-6 border-t border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px] truncate max-w-[140px]">
              {user?.email}
            </span>
            <span className="rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold uppercase">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 border border-stone-800 py-2 text-[11px] text-stone-300 hover:bg-stone-800 hover:text-white transition"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Live Store</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/admin");
              }}
              className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-stone-600 hover:text-stone-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-serif text-base sm:text-lg font-medium text-stone-900">
              {navItems.find((n) => n.href === pathname)?.label || "Administration"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
              <span>View Storefront</span>
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
