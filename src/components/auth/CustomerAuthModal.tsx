"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerAuthModal({ isOpen, onClose }: CustomerAuthModalProps) {
  const router = useRouter();
  const { user, login, signup } = useAuth();

  // Auth Mode: "login" | "signup" | "forgot"
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password specific states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Clear errors and reset state when switching modes
  const switchAuthMode = (mode: "login" | "signup" | "forgot") => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (mode === "forgot") {
      setForgotStep(1);
      setOtpCode("");
      setNewPassword("");
    }
  };

  // If user is already logged in, close modal and redirect to /account
  useEffect(() => {
    if (isOpen && user) {
      onClose();
      router.push("/account");
    }
  }, [isOpen, user, onClose, router]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || user) return null;

  // Handle Customer Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailClean = email.trim();
    if (!emailClean || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(emailClean, password, false);
      if (success) {
        setEmail("");
        setPassword("");
        onClose();
        router.push("/account");
      } else {
        setErrorMessage(
          "Invalid email or password. Please verify your credentials or use Forgot Password."
        );
      }
    } catch {
      setErrorMessage("A connection error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Customer Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailClean = email.trim();
    if (!fullName.trim() || !emailClean || !password) {
      setErrorMessage("Please complete all required fields (Name, Email, and Password).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await signup(emailClean, password, fullName.trim());
      if (success) {
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
        onClose();
        router.push("/account");
      } else {
        setErrorMessage(
          "An account with this email address already exists. Please switch to Sign In."
        );
      }
    } catch {
      setErrorMessage("Could not complete registration. Please check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send OTP (Forgot Password Step 1)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailClean = email.trim().toLowerCase();
    if (!emailClean || !emailClean.includes("@")) {
      setErrorMessage("Please provide a valid registered email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailClean, role: "customer" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to dispatch verification code.");
        if (data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
        }
        return;
      }

      setSuccessMessage(data.message || "Verification code sent to your email.");
      setCooldownSeconds(data.cooldownSeconds || 60);
      setForgotStep(2);
    } catch {
      setErrorMessage("Network error sending code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reset Password with OTP (Forgot Password Step 2)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit verification code from your email.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters in length.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role: "customer",
          otp: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password.");
        return;
      }

      // Success!
      setSuccessMessage("Your password has been updated. Please sign in with your new password.");
      setAuthMode("login");
      setPassword("");
      setOtpCode("");
      setNewPassword("");
      setForgotStep(1);
    } catch {
      setErrorMessage("Network error updating password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1.5 mb-6">
            <span className="font-serif text-xl sm:text-2xl font-light tracking-[0.25em] text-stone-950 block">
              LUMERO
            </span>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              {authMode === "forgot" ? "Account Recovery" : "Customer Sanctuary"}
            </h3>
            <p className="text-xs text-stone-500 font-light max-w-xs mx-auto">
              {authMode === "forgot"
                ? "Verify your registered email address with a secure code to reset your password."
                : "Sign in to manage your saved delivery address, view past orders, and enjoy faster checkout."}
            </p>
          </div>

          {/* Segmented Tab Switch: Login vs Register (only when not in forgot mode) */}
          {authMode !== "forgot" ? (
            <div className="flex rounded-2xl bg-stone-100 p-1 mb-5 border border-stone-200/60">
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  authMode === "login"
                    ? "bg-white text-stone-950 shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode("signup")}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  authMode === "signup"
                    ? "bg-white text-stone-950 shadow-xs"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between text-xs border-b border-stone-100 pb-3">
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                className="inline-flex items-center gap-1.5 font-medium text-stone-600 hover:text-stone-950 transition"
              >
                ← Back to Sign In
              </button>
              <span className="font-semibold text-stone-400">Step {forgotStep} of 2</span>
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-950 text-emerald-100 border border-emerald-800 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] sm:text-xs leading-relaxed">
                <span className="font-serif tracking-wide block text-emerald-300 font-medium mb-0.5">
                  Success
                </span>
                <span className="text-emerald-100 font-sans">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-400 hover:text-white p-0.5 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] sm:text-xs leading-relaxed">
                <span className="font-serif tracking-wide block text-amber-300 font-medium mb-0.5">
                  Notice
                </span>
                <span className="text-stone-300 font-sans">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-white p-0.5 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
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
                    onClick={() => switchAuthMode("forgot")}
                    className="text-[11px] text-stone-500 hover:text-stone-950 font-medium underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-10 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-500">
                  New to Lumero?{" "}
                  <button
                    type="button"
                    onClick={() => switchAuthMode("signup")}
                    className="text-stone-950 font-semibold underline hover:text-amber-800"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {authMode === "signup" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Phone (for express delivery updates)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password (at least 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-10 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Join LUMERO</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchAuthMode("login")}
                    className="text-stone-950 font-semibold underline hover:text-amber-800"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD FLOW */}
          {authMode === "forgot" && (
            <div>
              {forgotStep === 1 ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Enter Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="customer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      We will transmit a time-limited 6-digit OTP code to this address.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cooldownSeconds > 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-white py-3 text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50 mt-2"
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
                /* Step 2: Verify OTP & Set New Password */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-stone-700">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        disabled={cooldownSeconds > 0 || isSubmitting}
                        onClick={handleSendOtp}
                        className="text-[11px] text-amber-700 hover:text-amber-900 disabled:opacity-50 flex items-center gap-1 font-medium"
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
                        placeholder="e.g. 549812"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-xs text-stone-900 font-mono tracking-widest focus:border-stone-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      New Password (Minimum 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-10 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
