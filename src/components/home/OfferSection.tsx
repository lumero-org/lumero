"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OfferBannerContent } from "@/types";

interface OfferSectionProps {
  offer: OfferBannerContent | null;
  isLoading?: boolean;
}

export function OfferSection({ offer, isLoading }: OfferSectionProps) {
  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full h-[372px] rounded-3xl bg-stone-200/70 animate-pulse" />
      </section>
    );
  }

  // If no offer configured or is inactive, don't display
  if (!offer || offer.is_active === false) {
    return null;
  }

  const {
    image_url,
    heading,
    description,
    button_text = "Shop Now",
    button_link = "/shop",
  } = offer;

  // Don't render empty banner if no image and no heading
  if (!image_url && !heading) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Container: No border, 372px desktop height, bottom-left aligned content */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-stone-900 shadow-xl min-h-[350px] sm:min-h-[360px] md:h-[372px] flex items-end">
        {/* Background Image */}
        {image_url && (
          <Image
            src={image_url}
            alt={heading || "Promotional Offer"}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1430px) 100vw, 1430px"
          />
        )}

        {/* Gradient Overlay: darkens bottom-left for crisp readability, keeps top-right bright */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/60 to-transparent sm:bg-gradient-to-tr sm:from-stone-950/95 sm:via-stone-950/50 sm:to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-stone-950/15 pointer-events-none" />

        {/* Content Container (Bottom-left placed on all screen sizes) */}
        <div className="relative z-10 w-full max-w-xl px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-8 space-y-2.5 sm:space-y-3.5">
          {heading && (
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-[2rem] lg:leading-[2.4rem] font-normal text-white tracking-tight">
              {heading}
            </h2>
          )}

          {description && (
            <p className="text-[11px] sm:text-xs md:text-sm text-stone-200 font-light leading-relaxed max-w-lg line-clamp-3 sm:line-clamp-none">
              {description}
            </p>
          )}

          <div className="pt-1">
            <Link
              href={button_link || "/shop"}
              className="inline-flex items-center gap-2 rounded-full bg-white text-stone-950 px-5 py-2.5 sm:px-6 sm:py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 hover:shadow-lg transition duration-300 shrink-0"
            >
              <span>{button_text || "Shop Now"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
