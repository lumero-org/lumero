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
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, login, logout, isLoading } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Admin Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [adminOtp, setAdminOtp] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown timer
  React.useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(adminEmail, adminPassword, true);
    } catch {
      setErrorMessage("Authentication failed. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailClean = adminEmail.trim().toLowerCase();
    if (!emailClean) {
      setErrorMessage("Please enter your administrator email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailClean, role: "admin" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to dispatch verification code.");
        if (data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
        }
        return;
      }

      setSuccessMessage(data.message || "Admin verification code sent.");
      setCooldownSeconds(data.cooldownSeconds || 60);
      setForgotStep(2);
    } catch {
      setErrorMessage("Network error requesting verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminOtp.trim() || adminOtp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code from your email.");
      return;
    }

    if (!adminNewPassword || adminNewPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          role: "admin",
          otp: adminOtp.trim(),
          newPassword: adminNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset administrator password.");
        return;
      }

      setSuccessMessage("Administrator password updated successfully. Please sign in.");
      setIsForgotPassword(false);
      setForgotStep(1);
      setAdminPassword("");
      setAdminOtp("");
      setAdminNewPassword("");
    } catch {
      setErrorMessage("Network error updating password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "CMS & Sections", href: "/admin/cms", icon: FileEdit },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // If loading session
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-900 text-stone-300">
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white text-stone-900">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl space-y-6">
          {/* Header (Top icon removed as requested) */}
          <div className="text-center space-y-2">
            <span className="font-serif text-2xl font-light tracking-[0.25em] text-stone-950 block">
              LUMERO
            </span>
            <h1 className="font-serif text-lg font-medium text-stone-900">
              {isForgotPassword ? "Admin Account Recovery" : "Admin Portal Login"}
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              {isForgotPassword
                ? "Verify your administrator email with a secure code sent via Brevo to reset your password."
                : "Sign in with your administrator credentials to access the store management suite."}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-serif block text-emerald-800 font-medium mb-0.5">Success</span>
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-950"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-850 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span className="font-serif block text-amber-300 font-medium mb-0.5">Notice</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!isForgotPassword ? (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Admin Email / Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-stone-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotStep(1);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-950 underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-10 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-white py-3 text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
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
          ) : (
            /* ADMIN FORGOT PASSWORD FLOW */
            <div>
              <div className="mb-4 flex items-center justify-between text-xs border-b border-stone-200 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMessage(null);
                  }}
                  className="text-stone-500 hover:text-stone-950 transition font-medium"
                >
                  ← Back to Admin Login
                </button>
                <span className="text-stone-400 font-mono">Step {forgotStep} of 2</span>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleSendAdminOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Administrator Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cooldownSeconds > 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-white py-3 text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Sending Code...</span>
                      </>
                    ) : cooldownSeconds > 0 ? (
                      <span>Resend in {cooldownSeconds}s</span>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetAdminPassword} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-stone-700">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        disabled={cooldownSeconds > 0 || isSubmitting}
                        onClick={handleSendAdminOtp}
                        className="text-[11px] text-stone-700 hover:text-stone-950 disabled:opacity-50 flex items-center gap-1 font-medium"
                      >
                        <RotateCw className="w-3 h-3" />
                        {cooldownSeconds > 0 ? `Resend (${cooldownSeconds}s)` : "Resend Code"}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={adminOtp}
                        onChange={(e) => setAdminOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-4 py-2.5 text-xs text-stone-900 font-mono tracking-widest placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      New Administrator Password (Min 6 chars)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        placeholder="Enter new password"
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-10 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700"
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-white py-3 text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Admin Password</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Link */}
          <div className="pt-4 border-t border-stone-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-950 transition"
            >
              <span>← Back to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  // Requirement 9: Left sidebar fixed, main content independently scrollable, no horizontal scrolling
  return (
    <div className="h-screen w-full bg-stone-100 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Pinned fixed position on desktop with independent internal scroll */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-stone-950 text-stone-300 flex flex-col justify-between shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto overflow-x-hidden border-r border-stone-800 select-none ${
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
                Admin &amp; CMS Suite
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
        <div className="p-6 border-t border-stone-800/80 space-y-3 shrink-0">
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

      {/* Main Content Area - Independently scrollable */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Fixed Header */}
        <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between shrink-0 z-10">
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

        {/* Independently Scrollable Main Content Pane */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            border: "1px solid #E7E5E4",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </div>
  );
}
