"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check, Eye } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const mainImage = product.images[0]?.url || "/placeholder.png";
  const hoverImage = product.images[1]?.url || mainImage;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 4;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200/80 shadow-xs transition duration-300 hover:shadow-lg hover:border-stone-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-stone-100"
      >
        <Image
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="rounded-full bg-stone-900/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium tracking-wide text-white">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-600/95 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium tracking-wide text-white shadow-xs">
              Only {product.stock_quantity} Left
            </span>
          ) : product.tags?.[0] ? (
            <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium tracking-wide text-stone-800 shadow-xs border border-stone-200">
              {product.tags[0]}
            </span>
          ) : null}
        </div>

        {/* Quick Actions overlay on desktop hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold tracking-wide transition shadow-md ${
              isOutOfStock
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : isAddedRecently
                ? "bg-emerald-700 text-white"
                : "bg-stone-950 text-white hover:bg-stone-800"
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added!</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-stone-800 shadow-md hover:bg-stone-100 transition"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </div>
        </div>
      </Link>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">
          {product.category_name || "Lumero"}
        </span>

        <h3 className="mt-1 font-serif text-sm sm:text-base font-normal text-stone-900 group-hover:text-stone-700 transition line-clamp-1">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm sm:text-base font-semibold text-stone-900">
            ₹{product.price.toLocaleString()}
          </span>

          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-stone-400 line-through">
              ₹{product.compare_at_price.toLocaleString()}
            </span>
          )}

          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="ml-auto text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="mt-2 text-[11px] flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOutOfStock
                ? "bg-stone-300"
                : isLowStock
                ? "bg-amber-500 animate-pulse"
                : "bg-emerald-500"
            }`}
          />
          <span className={isOutOfStock ? "text-stone-400" : isLowStock ? "text-amber-700 font-medium" : "text-stone-500"}>
            {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${product.stock_quantity} left` : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

