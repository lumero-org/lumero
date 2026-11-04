"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const ok = await login(email, password);
        if (ok) {
          if (email.toLowerCase().includes("admin")) {
            router.push("/admin");
          } else {
            router.push("/shop");
          }
        }
      } else {
        const ok = await signup(email, password, name);
        if (ok) {
          router.push("/shop");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="rounded-3xl bg-white p-8 sm:p-10 border border-stone-200/90 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="font-serif text-2xl font-light tracking-[0.25em] text-stone-950">
            LUMERO
          </span>
          <h1 className="font-serif text-xl font-normal text-stone-900">
            {mode === "login" ? "Welcome Back" : "Join the LUMERO Collective"}
          </h1>
          <p className="text-xs text-stone-500">
            {mode === "login"
              ? "Access your saved wishlists, past orders, and admin controls."
              : "Experience elevated home interior curation."}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "login" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === "signup" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Kavita Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>{mode === "login" ? "Sign In" : "Register"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Admin Link */}
        <div className="pt-4 border-t border-stone-200 text-center">
          <Link
            href="/admin"
            className="text-[11px] text-stone-500 hover:text-stone-900 transition underline"
          >
            Store Manager or Administrator? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

