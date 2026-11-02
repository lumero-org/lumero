"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import { getProducts, getOrders } from "@/lib/store";
import { Product, Order } from "@/types";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, o] = await Promise.all([getProducts(), getOrders()]);
        setProducts(p);
        setOrders(o);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total_amount, 0);
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 4);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Overview & Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Store Performance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products?action=new"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="mt-1 block text-[11px] text-stone-400">
              Across {orders.length} lifetime orders
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
              {orders.length}
            </span>
            <span className="mt-1 block text-[11px] text-stone-400">
              Customer & guest checkouts
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Active Catalog
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
              {products.length}
            </span>
            <span className="mt-1 block text-[11px] text-stone-400">
              Interior décor products
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-2xl sm:text-3xl font-medium text-stone-950">
              {lowStockProducts.length}
            </span>
            <span className="mt-1 block text-[11px] text-amber-700 font-medium">
              Products with ≤ 4 stock left
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-800 shrink-0" />
            <div>
              <strong className="text-xs font-semibold text-amber-950 block">
                Immediate Inventory Attention Required:
              </strong>
              <p className="text-xs text-amber-800">
                {lowStockProducts.map((p) => `${p.name} (${p.stock_quantity} left)`).join(", ")}
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="rounded-full bg-amber-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 shrink-0"
          >
            Manage Stock
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-medium text-stone-900">
              Recent Orders
            </h3>
            <p className="text-xs text-stone-500">
              Latest transactions placed across Razorpay & COD.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-stone-900 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No orders placed yet. Place an order on the storefront to test!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-medium">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-stone-900">
                      {ord.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900 block">
                        {ord.customer_name}
                      </span>
                      <span className="text-[11px] text-stone-400">{ord.customer_email}</span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {ord.items.length} item{ord.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      ₹{ord.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                          ord.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.payment_method.toUpperCase()} • {ord.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700 capitalize">
                        {ord.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

