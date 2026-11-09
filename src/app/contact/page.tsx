"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Clock, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getStoreSettings, defaultStoreSettings } from "@/lib/store";
import { StoreSettings } from "@/types";

export default function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    getStoreSettings().then((loaded) => {
      if (loaded) {
        setSettings(loaded);
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitted(true);
    toast.success("Message Sent", {
      description: "Our customer concierge will get back to you within 24 hours.",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Concierge Support
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950">
          We Are Here To Assist
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
          Have an inquiry about dimensions, bespoke styling advice, or an existing order? Reach out to our design concierge team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-2xs">
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 mb-2">
              {settings.storeName || "LUMERO Studio & Care"}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              {settings.contactSubtitle ||
                "Crafting calm, elevated living spaces across India with care and dedication."}
            </p>
          </div>

          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-amber-800 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-stone-900">Email Concierge</strong>
                <a
                  href={`mailto:${settings.supportEmail || "care@lumerodecor.com"}`}
                  className="hover:underline text-stone-700"
                >
                  {settings.supportEmail || "care@lumerodecor.com"}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-amber-800 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-stone-900">Phone Assistance</strong>
                <span>
                  {settings.supportPhone || "+91 98765 43210"}
                  {settings.supportHours ? ` (${settings.supportHours})` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-amber-800 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-stone-900">Response Window</strong>
                <span>{settings.responseWindow || "Usually within 4 business hours"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-medium text-stone-900">
                Thank You For Writing To Us
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Your message has been received. One of our home styling specialists will get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white uppercase tracking-wider"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Inquiry about styling / order / dimensions"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist in crafting your space?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Send Note to Concierge</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

