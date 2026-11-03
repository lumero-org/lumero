"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Package,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { getProducts, getCategories, saveProduct, deleteProduct } from "@/lib/store";
import { Product, Category, ProductImage } from "@/types";
import { CloudinaryUploader } from "@/components/ui/CloudinaryUploader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const shouldOpenNew = searchParams.get("action") === "new";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()]);
      setProducts(p);
      setCategories(c);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (shouldOpenNew && categories.length > 0) {
      handleOpenCreate();
    }
  }, [shouldOpenNew, categories]);

  const handleOpenCreate = () => {
    setEditingProduct({
      id: "",
      name: "",
      slug: "",
      description: "",
      price: 1999,
      compare_at_price: 2499,
      category_id: categories[0]?.id || "lighting",
      category_name: categories[0]?.name || "Lighting",
      stock_quantity: 10,
      is_featured: false,
      images: [],
      tags: ["Modern", "Handcrafted"],
      dimensions: "",
      materials: "",
      care_instructions: "",
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.price) {
      toast.error("Please provide product name and price.");
      return;
    }

    setIsSaving(true);
    try {
      const cat = categories.find((c) => c.id === editingProduct.category_id);
      const saved = await saveProduct({
        ...editingProduct,
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category_name: cat?.name || editingProduct.category_name || "Décor",
      });

      toast.success("Product Saved Successfully", {
        description: `${saved.name} is now live with ${saved.stock_quantity} in stock.`,
      });

      setIsEditorOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Failed to save product", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      // Deletes product from store/DB AND removes all associated images from Cloudinary!
      await deleteProduct(productToDelete.id);
      toast.success("Product & Media Deleted", {
        description: `Permanently removed ${productToDelete.name} and cleared all its Cloudinary assets.`,
      });
      setProductToDelete(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error("Delete failed", { description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "all") {
      const catObj = categories.find((c) => c.id === selectedCategory || c.slug === selectedCategory);
      const matchId = p.category_id === selectedCategory;
      const matchSlug = catObj && (p.category_id === catObj.id || p.category_id === catObj.slug);
      if (!matchId && !matchSlug) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Catalog Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Products ({products.length})
          </h1>
          <p className="text-xs text-stone-500">
            Configure stock quantities, pricing, and 5-image compressed Cloudinary galleries.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-xs flex-1 max-w-md focus-within:border-stone-900">
          <Search className="h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search products by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-hidden bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock Quantity</th>
                <th className="px-6 py-3.5">Images (Max 5)</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No products match your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock_quantity <= 0;
                  const isLowStock = p.stock_quantity > 0 && p.stock_quantity <= 4;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      {/* Product Name & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                            <Image
                              src={p.images[0]?.url || "/placeholder.png"}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-medium text-stone-900 block max-w-xs truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-stone-600">
                        {p.category_name || p.category_id}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-stone-900 block">
                          ₹{p.price.toLocaleString()}
                        </span>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{p.compare_at_price.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isLowStock
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {p.stock_quantity} in stock
                          </span>
                        </div>
                      </td>

                      {/* Image count */}
                      <td className="px-6 py-4 text-stone-500">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                          {p.images.length} / 5
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                            title="View product on live store"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product and Cloudinary Media"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isEditorOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsEditorOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-stone-900">
                  {editingProduct.id ? "Edit Product" : "Add New Interior Piece"}
                </h3>
                <p className="text-xs text-stone-500">
                  Compresses up to 5 images on upload and manages stock.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Image Upload Area with Client Compression & 5 Image Limit */}
              <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200">
                <CloudinaryUploader
                  images={editingProduct.images || []}
                  onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                  maxImages={5}
                  isProduct={true}
                  folder="lumero/products"
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sculptural Travertine Table Lamp"
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProduct.category_id || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs focus:border-stone-900 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Stock Quantity (Order Limit) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="2499"
                    value={editingProduct.price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Original / Strike-through Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3499"
                    value={editingProduct.compare_at_price || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, compare_at_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Product Narrative & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Atmospheric narrative and design details..."
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Dimensions, Materials, Care */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="45cm x 30cm"
                    value={editingProduct.dimensions || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Materials
                  </label>
                  <input
                    type="text"
                    placeholder="Travertine, Linen"
                    value={editingProduct.materials || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, materials: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Care Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Dry wipe only"
                    value={editingProduct.care_instructions || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, care_instructions: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={Boolean(editingProduct.is_featured)}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span>Show as Featured Product on Homepage</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-full border border-stone-300 px-5 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-stone-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 shadow-md"
                >
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Purges Cloudinary media + DB) */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product & Purge Cloudinary Media?"
        description={`Are you sure you want to delete "${productToDelete?.name}"? All associated images (${productToDelete?.images.length || 0}) will be permanently wiped from Cloudinary storage and database.`}
        confirmText="Delete & Purge Media"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading products panel...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}

