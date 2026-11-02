"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/store";
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

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setIsLoading(true);
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
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-stone-900 border-t-transparent" />
        <p className="mt-4 font-serif text-stone-500">Curating product details...</p>
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
  const currentImage = images[selectedImageIndex]?.url || images[0].url;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Image Gallery (Up to 5 images with luxury layout & interactive thumbnails) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[560px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {images.slice(0, 5).map((img, idx) => (
                  <button
                    key={img.public_id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition shrink-0 bg-stone-100 ${
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

            {/* Main Stage Image */}
            <div className="relative flex-1 aspect-square sm:aspect-4/5 overflow-hidden rounded-3xl bg-stone-100 border border-stone-200/90 shadow-md group">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
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
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
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

              {/* Stock Meter */}
              <div className="mt-6 rounded-2xl bg-stone-100/70 p-4 border border-stone-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-700">Availability</span>
                  <span
                    className={
                      isOutOfStock
                        ? "text-rose-600 font-semibold"
                        : isLowStock
                        ? "text-amber-700 font-semibold animate-pulse"
                        : "text-emerald-700 font-semibold"
                    }
                  >
                    {isOutOfStock
                      ? "Currently Out of Stock"
                      : isLowStock
                      ? `Hurry! Only ${product.stock_quantity} left to order`
                      : `${product.stock_quantity} units ready for immediate dispatch`}
                  </span>
                </div>
                {/* Visual stock bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOutOfStock
                        ? "bg-stone-300 w-0"
                        : isLowStock
                        ? "bg-amber-500 w-1/4"
                        : "bg-emerald-600 w-3/4"
                    }`}
                  />
                </div>
              </div>

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

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => addToCart(product, quantity)}
                      className="flex items-center justify-center gap-2 rounded-full border border-stone-900 bg-white px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:bg-stone-50 transition shadow-xs"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
                    >
                      <Zap className="h-4 w-4 text-amber-400" />
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

