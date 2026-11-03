"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/store";
import { Order, OrderStatus } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("Order Status Updated", {
        description: `Order updated to ${newStatus.toUpperCase()}`,
      });

      // If status changed to Shipped, dispatch Brevo shipping notification email (idempotent)
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

      await loadData();
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
    await handleStatusChange(orderToCancel.id, "cancelled");
    setOrderToCancel(null);
  };

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== "all" && ord.order_status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.order_number.toLowerCase().includes(q) ||
        ord.customer_name.toLowerCase().includes(q) ||
        ord.customer_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Orders ({orders.length})
          </h1>
          <p className="text-xs text-stone-500">
            Manage customer shipments, track Razorpay authorizations, and process COD dispatches.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-xs flex-1 max-w-md focus-within:border-stone-900">
          <Search className="h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order number or customer name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer (Guest / User)</th>
                <th className="px-6 py-3.5">Total & Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50">
                    <td className="px-6 py-4 font-mono font-semibold text-stone-950">
                      {ord.order_number}
                    </td>

                    <td className="px-6 py-4 text-stone-500">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-stone-900 block">
                        {ord.customer_name}
                      </span>
                      <span className="text-[11px] text-stone-400">{ord.customer_email}</span>
                      <span className="text-[10px] text-stone-400 block">
                        {ord.customer_id ? "Registered Member" : "Guest Purchase"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900 block">
                        ₹{ord.total_amount.toLocaleString()}
                      </span>
                      <span
                        className={`inline-block mt-0.5 rounded-full px-2 py-0.2 text-[10px] font-medium uppercase ${
                          ord.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {ord.payment_method.toUpperCase()} • {ord.payment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={ord.order_status}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value as OrderStatus)
                        }
                        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-800 outline-hidden"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-800 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
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
                <p className="text-stone-700">{selectedOrder.shipping_address.address}</p>
                <p className="text-stone-700">
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.postal_code}
                </p>
                <p className="text-stone-500">{selectedOrder.shipping_address.country}</p>
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
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium"
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
                  className="text-xs font-medium text-rose-600 hover:underline"
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

