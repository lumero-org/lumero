"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { getProductBySlug, getProducts, getAdminWhatsAppNumber } from "@/lib/store";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/products/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "materials" | "shipping">("specs");
  const [isLoading, setIsLoading] = useState(true);

  // Touch Swipe Gesture Tracking for Mobile Image Gallery with smooth animation
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchCurrentX(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || touchStartX === null) return;
    setTouchCurrentX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null && images.length > 1) {
      const distance = touchStartX - touchCurrentX;
      if (distance > minSwipeDistance) {
        // Swiped Left -> Next Image
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      } else if (distance < -minSwipeDistance) {
        // Swiped Right -> Previous Image
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
    setIsSwiping(false);
  };

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setIsLoading(true);
      setSelectedImageIndex(0);
      setQuantity(1);
      try {
        const item = await getProductBySlug(slug);
        setProduct(item);
        if (item) {
          const all = await getProducts();
          const related = all
            .filter((p) => p.id !== item.id && p.category_id === item.category_id)
            .slice(0, 4);
          setRelatedProducts(related.length > 0 ? related : all.filter((p) => p.id !== item.id).slice(0, 4));
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  // Luxury Skeleton Loader for Product Details
  if (isLoading) {
    return (
      <div className="pb-24">
        {/* Breadcrumb skeleton */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="h-4 w-44 bg-stone-200/80 rounded-md animate-pulse" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery Skeleton */}
            <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3.5 max-w-lg mx-auto w-full">
              <div className="flex sm:flex-col gap-2.5 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-stone-200/80 animate-pulse shrink-0" />
                ))}
              </div>
              <div className="flex-1 aspect-square max-h-[440px] sm:max-h-[480px] rounded-3xl bg-stone-200/80 animate-pulse border border-stone-200/60" />
            </div>

            {/* Details Skeleton */}
            <div className="lg:col-span-6 space-y-6">
              <div className="h-5 w-24 bg-stone-200/80 rounded-full animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-8 w-4/5 bg-stone-200/80 rounded-lg animate-pulse" />
                <div className="h-8 w-2/3 bg-stone-200/80 rounded-lg animate-pulse" />
              </div>
              <div className="h-7 w-32 bg-stone-200/80 rounded-md animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-stone-200/70 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-200/70 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-stone-200/70 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="h-11 w-28 bg-stone-200/80 rounded-xl animate-pulse" />
                <div className="h-11 flex-1 bg-stone-200/80 rounded-xl animate-pulse" />
              </div>
              <div className="pt-6 border-t border-stone-200 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-stone-200/70 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h2 className="font-serif text-2xl font-light text-stone-900">
          Piece Not Found
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          The requested decor item is either unavailable or has been archived.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white uppercase tracking-wider"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const images = product.images.length > 0 ? product.images : [{ url: "/placeholder.png", public_id: "default" }];

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleWhatsAppOrder = async () => {
    const configuredPhone = await getAdminWhatsAppNumber();
    const adminPhone = configuredPhone.replace(/\D/g, "") || "919876543210";
    const totalPrice = (product.price * quantity).toLocaleString("en-IN");
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const message = `Hello LUMERO,\n\nI would like to place an order for:\n• *Product:* ${product.name}\n• *Quantity:* ${quantity}\n• *Price:* ₹${totalPrice}\n• *Product Link:* ${currentUrl}\n\nPlease confirm availability and payment details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-stone-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-stone-900">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-stone-900 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Image Gallery (Decreased, balanced size with interactive thumbnails) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3.5 max-w-lg mx-auto w-full">
            {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={img.public_id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 transition shrink-0 bg-stone-100 ${
                      selectedImageIndex === idx
                        ? "border-stone-950 shadow-md ring-1 ring-stone-950/20"
                        : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image (Compact, restrained size with smooth touch swipe support) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className="relative flex-1 aspect-square max-h-[440px] sm:max-h-[480px] overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/90 shadow-md group touch-pan-y select-none"
            >
              {/* Smooth Carousel Track */}
              <div
                className={`flex h-full w-full ${
                  isSwiping ? "" : "transition-transform duration-300 ease-out"
                }`}
                style={{
                  transform: `translateX(calc(-${selectedImageIndex * 100}% + ${
                    isSwiping && touchStartX !== null && touchCurrentX !== null
                      ? touchCurrentX - touchStartX
                      : 0
                  }px))`,
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.public_id || idx}
                    className="relative min-w-full h-full flex-shrink-0"
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 1024px) 100vw, 45vw"
                    />
                  </div>
                ))}
              </div>

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {isOutOfStock ? (
                  <span className="rounded-full bg-stone-900/95 backdrop-blur-xs px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Sold Out
                  </span>
                ) : isLowStock ? (
                  <span className="rounded-full bg-amber-600/95 backdrop-blur-xs px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Only {product.stock_quantity} Left in Stock
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-700/90 backdrop-blur-xs px-3 py-1 text-xs font-medium text-white shadow-sm flex items-center gap-1">
                    <Check className="h-3 w-3" /> In Stock
                  </span>
                )}
              </div>

              {/* Desktop Prev / Next Slide Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    aria-label="Previous image"
                    className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev + 1) % images.length);
                    }}
                    aria-label="Next image"
                    className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-stone-800 shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Mobile Slide Indicator Dots */}
              {images.length > 1 && (
                <div className="sm:hidden absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/40 backdrop-blur-xs pointer-events-none">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === selectedImageIndex
                          ? "w-4 bg-white shadow-xs"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {product.category_name || "LUMERO"}
                </span>
                {product.tags?.[0] && (
                  <span className="text-xs text-stone-500 font-medium">
                    {product.tags[0]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-normal text-stone-950 leading-tight">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-base text-stone-400 line-through">
                      ₹{product.compare_at_price.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Save ₹{(product.compare_at_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Inclusive of all taxes. Free shipping on orders over ₹1,999.
              </p>

              {/* Description */}
              <div className="mt-6">
                <p className="text-sm text-stone-600 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* Purchase Controls */}
              {!isOutOfStock && (
                <div className="mt-8 space-y-4">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-600">
                      Quantity:
                    </span>
                    <div className="flex items-center rounded-xl border border-stone-300 bg-white p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center font-serif text-sm font-semibold text-stone-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                        disabled={quantity >= product.stock_quantity}
                        className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-stone-400">
                      (Max {product.stock_quantity})
                    </span>
                  </div>

                  {/* Buttons: WhatsApp Order first, then Add to Cart, Large Buy Now button below */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-white px-3 sm:px-5 py-3.5 text-xs font-semibold uppercase tracking-wider transition shadow-xs"
                      >
                        <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.301-.777.98-.953 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.787-1.676-2.088-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.201-.301.301-.501.1-.201.05-.376-.025-.527-.075-.15-.677-1.632-.928-2.235-.245-.589-.494-.509-.677-.518-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.802.376-.276.301-1.053 1.028-1.053 2.508s1.079 2.909 1.229 3.11c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.119.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.175-1.431-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.028 6.485 2.028 12c0 1.954.56 3.778 1.53 5.323L2 22l4.823-1.508C8.307 21.378 10.117 22 12.04 22c5.525 0 10.013-4.485 10.013-10S17.565 2 12.04 2z" />
                        </svg>
                        <span className="truncate">WhatsApp Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addToCart(product, quantity)}
                        className="flex items-center justify-center gap-2 rounded-full border border-stone-900 bg-white px-3 sm:px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:bg-stone-50 active:scale-98 transition shadow-xs"
                      >
                        <ShoppingBag className="h-4 w-4 shrink-0" />
                        <span className="truncate">Add to Cart</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white hover:bg-stone-800 active:scale-98 transition shadow-md"
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              )}

              {isOutOfStock && (
                <div className="mt-8 rounded-2xl bg-stone-100 p-6 text-center border border-stone-200">
                  <p className="font-serif text-stone-900 font-medium">Currently Out of Stock</p>
                  <p className="mt-1 text-xs text-stone-500">
                    We are handcrafting a new batch. Check back soon or browse related designs.
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-b border-stone-200 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="h-4 w-4 text-amber-800" />
                  <span className="text-[11px] font-medium text-stone-800">Pan-India Express</span>
                  <span className="text-[9px] text-stone-400">3-5 Day Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-stone-200">
                  <ShieldCheck className="h-4 w-4 text-amber-800" />
                  <span className="text-[11px] font-medium text-stone-800">Authentic Material</span>
                  <span className="text-[9px] text-stone-400">Natural & Hand-finished</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="h-4 w-4 text-amber-800" />
                  <span className="text-[11px] font-medium text-stone-800">Transit Guarantee</span>
                  <span className="text-[9px] text-stone-400">7-Day Free Replacement</span>
                </div>
              </div>

              {/* Specifications Tabs */}
              <div className="mt-6">
                <div className="flex border-b border-stone-200 text-xs">
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`pb-3 font-medium tracking-wide uppercase transition border-b-2 mr-6 ${
                      activeTab === "specs"
                        ? "border-stone-950 text-stone-950"
                        : "border-transparent text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    Dimensions
                  </button>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`pb-3 font-medium tracking-wide uppercase transition border-b-2 mr-6 ${
                      activeTab === "materials"
                        ? "border-stone-950 text-stone-950"
                        : "border-transparent text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    Materials & Care
                  </button>
                  <button
                    onClick={() => setActiveTab("shipping")}
                    className={`pb-3 font-medium tracking-wide uppercase transition border-b-2 ${
                      activeTab === "shipping"
                        ? "border-stone-950 text-stone-950"
                        : "border-transparent text-stone-400 hover:text-stone-700"
                    }`}
                  >
                    Delivery Details
                  </button>
                </div>

                <div className="pt-4 text-xs text-stone-600 leading-relaxed">
                  {activeTab === "specs" && (
                    <div className="space-y-2">
                      <p>
                        <strong className="text-stone-900">Dimensions:</strong>{" "}
                        {product.dimensions || "Refer to product specifications sheet."}
                      </p>
                      <p>
                        <strong className="text-stone-900">Collection SKU:</strong> LUM-
                        {product.slug.toUpperCase().slice(0, 8)}
                      </p>
                    </div>
                  )}

                  {activeTab === "materials" && (
                    <div className="space-y-2">
                      <p>
                        <strong className="text-stone-900">Materials:</strong>{" "}
                        {product.materials || "Natural sustainable materials crafted by master artisans."}
                      </p>
                      <p>
                        <strong className="text-stone-900">Care Instructions:</strong>{" "}
                        {product.care_instructions || "Wipe gently with a dry or lightly dampened microfiber cloth."}
                      </p>
                    </div>
                  )}

                  {activeTab === "shipping" && (
                    <div className="space-y-2">
                      <p>
                        Dispatched within 24-48 business hours via insured courier.
                        Delivered safely in custom honeycomb protective packaging.
                      </p>
                      <p className="text-stone-500">
                        Orders above ₹1,999 qualify for 100% complimentary delivery nationwide.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-stone-200 pt-16">
            <div className="text-center mb-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                Harmonious Living
              </span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-stone-950">
                You May Also Admire
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

