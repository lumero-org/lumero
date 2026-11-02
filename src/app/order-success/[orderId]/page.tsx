"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle2, Package, MapPin, ArrowRight, Truck } from "lucide-react";
import { getOrders } from "@/lib/store";
import { Order } from "@/types";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory luxury confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1C1917", "#C5A880", "#EAE6DF", "#D97706"],
      });
    } catch {
      // ignore
    }

    async function load() {
      if (!orderId) return;
      try {
        const orders = await getOrders();
        const found = orders.find((o) => o.id === orderId);
        setOrder(found || null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [orderId]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="rounded-3xl bg-white p-8 sm:p-12 border border-stone-200/90 shadow-xl text-center space-y-6">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-800">
            Order Confirmed
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-stone-950">
            Thank You For Your Order
          </h1>
          <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto font-light">
            We have begun carefully preparing your handcrafted interior pieces for safe transit.
          </p>
        </div>

        {order ? (
          <div className="rounded-2xl bg-stone-50 p-6 border border-stone-200 text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  Order Number
                </span>
                <span className="font-mono text-sm font-semibold text-stone-900">
                  {order.order_number}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  Payment Status
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-medium uppercase">
                  {order.payment_status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                  Total
                </span>
                <span className="font-serif text-sm font-medium text-stone-900">
                  ₹{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery address snippet */}
            <div className="flex items-start gap-3 text-xs text-stone-600">
              <MapPin className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Delivering to {order.customer_name}:</strong>
                <p>
                  {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.postal_code}
                </p>
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-2 border-t border-stone-200 pt-3">
              <span className="text-xs font-semibold text-stone-900 block">
                Ordered Items:
              </span>
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs text-stone-600">
                  <span>
                    {it.quantity}x {it.product_name}
                  </span>
                  <span className="font-medium text-stone-900">
                    ₹{it.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <p className="text-xs text-stone-400">Loading order receipt details...</p>
        ) : null}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

