"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, Sparkles } from "lucide-react";
import { WhyChooseSection as WhyChooseSectionType } from "@/types";

interface WhyChooseLumeroProps {
  data: WhyChooseSectionType | null;
  isLoading?: boolean;
}

export function WhyChooseLumero({ data, isLoading }: WhyChooseLumeroProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 aspect-[4/5] rounded-3xl bg-stone-200/70 animate-pulse" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-6 w-32 bg-stone-200 rounded" />
            <div className="h-10 w-64 bg-stone-200 rounded" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-stone-200/60 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no data configured, return null (strictly no mock data)
  if (!data || (!data.image_url && (!data.items || data.items.length === 0))) {
    return null;
  }

  const items = (data.items || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Restrained Featured Image */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-square sm:aspect-4/5 max-w-md mx-auto max-h-[380px] sm:max-h-[420px] w-full overflow-hidden rounded-3xl bg-stone-200 shadow-xl border border-stone-200">
            {data.image_url ? (
              <Image
                src={data.image_url}
                alt={data.title || "Why Choose Lumero"}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">
                <Sparkles className="h-10 w-10 text-stone-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
          </div>

          {/* Floating Aesthetic Accent */}
          <div className="absolute -bottom-4 -right-2 hidden sm:block rounded-2xl bg-white/95 backdrop-blur-md p-3.5 border border-stone-200 shadow-lg max-w-xs">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-800">
              Handcrafted Heritage
            </span>
            <p className="font-serif text-[11px] italic text-stone-800 mt-0.5">
              Natural materials molded with architectural precision.
            </p>
          </div>
        </div>

        {/* Right Side: Accordion Content */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              {data.subtitle || "The LUMERO Standard"}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-950 tracking-tight">
              {data.title || "Why Choose Lumero"}
            </h2>
          </div>

          {/* Accordion List */}
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={item.id || index} className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="flex w-full items-center justify-between py-1.5 text-left transition group"
                  >
                    <span className="font-serif text-sm sm:text-base font-normal text-stone-900 group-hover:text-amber-900 transition-colors">
                      {item.title}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 bg-stone-950 text-white border-stone-950" : "text-stone-500"
                      }`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-1.5 pb-2 pr-6 animate-in fade-in duration-200">
                      <p className="text-xs text-stone-600 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

