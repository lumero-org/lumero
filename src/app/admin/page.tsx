"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  Eye,
  X,
} from "lucide-react";
import { getProducts, getOrders, updateOrderStatus } from "@/lib/store";
import { Product, Order, OrderStatus } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [p, o] = await Promise.all([getProducts(), getOrders()]);
        setProducts(p);
        setOrders(o);
      } catch (e) {
        console.error("Failed to load admin stats:", e);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Order Status Updated", {
        description: `Order updated to ${newStatus.toUpperCase()}`,
      });

      if (newStatus === "shipped") {
        const orderObj = orders.find((o) => o.id === orderId) || selectedOrder;
        if (orderObj) {
          fetch("/api/email/order-shipped", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order: { ...orderObj, order_status: "shipped" },
              courierName: "Blue Dart / Delhivery Express",
            }),
          }).catch((err) => console.warn("Shipping email notice:", err));
        }
      }

      const refreshed = await getOrders();
      setOrders(refreshed);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error("Update error", { description: msg });
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      await updateOrderStatus(orderToCancel.id, "cancelled");
      toast.success("Order Cancelled", {
        description: `Order ${orderToCancel.order_number} has been cancelled.`,
      });
      const refreshed = await getOrders();
      setOrders(refreshed);
      if (selectedOrder?.id === orderToCancel.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: "cancelled" } : null));
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setOrderToCancel(null);
    }
  };

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

      {/* Quick Access to Key Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/cms"
          className="rounded-2xl bg-white p-5 border border-stone-200/90 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Promotional Banner
            </span>
            <h4 className="font-serif text-base font-medium text-stone-900 mt-1 group-hover:text-amber-900 transition-colors">
              Offer Section
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Update background image, headline, and CTA navigation.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-stone-900">
            <span>Manage Offer</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/cms"
          className="rounded-2xl bg-white p-5 border border-stone-200/90 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              About Page
            </span>
            <h4 className="font-serif text-base font-medium text-stone-900 mt-1 group-hover:text-amber-900 transition-colors">
              Why Choose Lumero
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Manage accordion items, featured photo, and sort ordering.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-stone-900">
            <span>Manage Accordions</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-2xl bg-white p-5 border border-stone-200/90 shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Curated Collections
            </span>
            <h4 className="font-serif text-base font-medium text-stone-900 mt-1 group-hover:text-amber-900 transition-colors">
              Store Categories
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Add new categories, upload cover imagery, and reorder.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-stone-900">
            <span>Manage Categories</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
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
                  <th className="px-6 py-3 text-right">Actions</th>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-800 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="font-mono text-xs text-stone-400">
                  {selectedOrder.order_number}
                </span>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  Order Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-stone-50 p-4 border border-stone-200 text-xs">
              <div>
                <strong className="block text-stone-900 font-serif mb-1">
                  Recipient
                </strong>
                <p className="font-medium text-stone-800">{selectedOrder.customer_name}</p>
                <p className="text-stone-500">{selectedOrder.customer_email}</p>
                <p className="text-stone-500">{selectedOrder.customer_phone}</p>
              </div>

              <div>
                <strong className="block text-stone-900 font-serif mb-1">
                  Shipping Destination
                </strong>
                {typeof selectedOrder.shipping_address === "string" ? (
                  <p className="text-stone-700">{selectedOrder.shipping_address}</p>
                ) : selectedOrder.shipping_address ? (
                  <>
                    <p className="text-stone-700">{selectedOrder.shipping_address.address}</p>
                    <p className="text-stone-700">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                      {selectedOrder.shipping_address.postal_code ? ` - ${selectedOrder.shipping_address.postal_code}` : ""}
                    </p>
                    {selectedOrder.shipping_address.country && (
                      <p className="text-stone-500">{selectedOrder.shipping_address.country}</p>
                    )}
                  </>
                ) : (
                  <p className="text-stone-500">Not provided</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-medium text-stone-900">
                Ordered Products
              </h4>
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 p-2">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <Image
                        src={it.product_image || "/placeholder.png"}
                        alt={it.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-serif text-xs font-medium text-stone-900 block">
                        {it.product_name}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Qty: {it.quantity} × ₹{it.price.toLocaleString()}
                      </span>
                    </div>
                    <span className="font-semibold text-xs text-stone-900">
                      ₹{it.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {selectedOrder.shipping_fee === 0 ? "Free" : `₹${selectedOrder.shipping_fee}`}
                </span>
              </div>
              <div className="flex justify-between font-serif font-semibold text-sm text-stone-950 border-t border-stone-200 pt-2">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="flex items-center justify-between border-t border-stone-200 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-stone-700">Update Status:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {selectedOrder.order_status !== "cancelled" && (
                <button
                  onClick={() => setOrderToCancel(selectedOrder)}
                  className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(orderToCancel)}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel This Order?"
        description={`Are you sure you want to cancel order ${orderToCancel?.order_number}? This will mark the order as cancelled.`}
        confirmText="Yes, Cancel Order"
      />
    </div>
  );
}

