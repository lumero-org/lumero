"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { getCategories, saveCategory, deleteCategory } from "@/lib/store";
import { Category } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { fileToDataUrl } from "@/lib/imageCompressor";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories:", e);
      toast.error("Failed to load categories from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory({
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      slug: "",
      description: "",
      image_url: "",
      image_public_id: "",
      sort_order: categories.length + 1,
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory({ ...c });
    setIsEditorOpen(true);
  };

  // Direct Category Image Upload Handler
  const handleUploadCategoryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const toastId = toast.loading("Uploading category image...");
    try {
      const dataPayload = await fileToDataUrl(file);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataPayload,
          folder: "lumero/categories",
          isCompressed: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setEditingCategory((prev) =>
        prev
          ? {
              ...prev,
              image_url: data.url,
              image_public_id: data.public_id,
            }
          : null
      );

      toast.success("Category image uploaded successfully", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error("Failed to upload category image", { id: toastId, description: msg });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveCategoryImage = () => {
    setEditingCategory((prev) =>
      prev
        ? {
            ...prev,
            image_url: "",
            image_public_id: "",
          }
        : null
    );
    toast.info("Category image removed");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const slug =
        editingCategory.slug?.trim() ||
        editingCategory.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const full: Category = {
        id: editingCategory.id || slug,
        name: editingCategory.name.trim(),
        slug,
        description: editingCategory.description?.trim() || "",
        image_url: editingCategory.image_url?.trim() || "",
        image_public_id: editingCategory.image_public_id || "",
        sort_order: Number(editingCategory.sort_order) || 1,
      };

      await saveCategory(full);
      toast.success("Category Saved", { description: `${full.name} has been updated in database.` });
      setIsEditorOpen(false);
      setEditingCategory(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error("Save error", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category Deleted", {
        description: `Removed ${categoryToDelete.name} from database.`,
      });
      setCategoryToDelete(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      toast.error("Delete error", { description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-stone-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
              Taxonomy & Visuals
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700">
              {categories.length} {categories.length === 1 ? "Category" : "Categories"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-1">
            Shop by Category Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage category names, category images, and display order for your home page and shop.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-60 rounded-2xl bg-white border border-stone-200/60 p-4 animate-pulse flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-full aspect-[3/2] rounded-xl bg-stone-200" />
              <div className="h-4 w-24 bg-stone-200 rounded" />
              <div className="h-3 w-16 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* Empty State (No Mock Data) */
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 mb-3">
            <Layers className="h-6 w-6 text-stone-500" />
          </div>
          <h3 className="font-serif text-lg font-medium text-stone-900">
            No Categories Configured
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-5">
            Your store currently has no categories in the database. Add your first category with an image and name to showcase it on the home page.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        /* Categories Cards Grid - Matching Box Height & Design Model */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs hover:border-stone-400 hover:shadow-md transition duration-200 h-full"
            >
              {/* Top: Category Image (Full Width and Height) */}
              <div>
                <div className="relative w-full aspect-[3/2] overflow-hidden bg-stone-100 flex items-center justify-center">
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 gap-1 p-2">
                      <ImageIcon className="h-7 w-7 text-stone-400" />
                      <span className="text-[10px] font-medium">No Image</span>
                    </div>
                  )}
                </div>

                {/* Category Name Directly Under Image */}
                <div className="p-3 text-center">
                  <h3 className="font-serif text-sm font-medium text-stone-900 group-hover:text-stone-950 line-clamp-1">
                    {c.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-stone-400">
                      /{c.slug}
                    </span>
                    <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-semibold text-stone-600">
                      #{c.sort_order}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons at Bottom */}
              <div className="flex items-center justify-center gap-2 border-t border-stone-100 py-2.5 px-3 bg-stone-50/50">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 transition cursor-pointer"
                  title="Edit Category & Image"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(c)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal: Category Image Upload & Category Name */}
      {isEditorOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-800" />
                <h3 className="font-serif text-base font-medium text-stone-900">
                  {editingCategory.name ? `Edit "${editingCategory.name}"` : "New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* 1. Category Image Upload Option */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-stone-600" />
                    <span>Category Image</span>
                  </label>
                  {editingCategory.image_url && (
                    <button
                      type="button"
                      onClick={handleRemoveCategoryImage}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Image Preview Thumbnail (Landscape Rectangle) */}
                  <div className="relative h-16 w-28 rounded-xl overflow-hidden bg-white border border-stone-200 shadow-xs shrink-0 flex items-center justify-center">
                    {editingCategory.image_url ? (
                      <Image
                        src={editingCategory.image_url}
                        alt="Category thumbnail"
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-stone-300" />
                    )}
                  </div>

                  {/* Upload Trigger Button */}
                  <div className="space-y-1.5 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition shadow-2xs w-full justify-center">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-3.5 w-3.5" />
                          <span>{editingCategory.image_url ? "Replace Image" : "Upload Image"}</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={handleUploadCategoryImage}
                      />
                    </label>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      Recommended: landscape rectangle (16:9 or 3:2) high-res image (JPEG/PNG/WebP).
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={editingCategory.image_url || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            image_url: e.target.value,
                            image_public_id: "",
                          }
                        : null
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              {/* 2. Category Name Option */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wall Décor, Lighting, Plants & Pots"
                  value={editingCategory.name || ""}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoSlug = newName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setEditingCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: newName,
                            slug: autoSlug,
                          }
                        : null
                    );
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Slug & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. wall-decor"
                    value={editingCategory.slug || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev
                          ? {
                              ...prev,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]+/g, ""),
                            }
                          : null
                      )
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono focus:border-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.sort_order ?? 1}
                    onChange={(e) =>
                      setEditingCategory((prev) =>
                        prev
                          ? {
                              ...prev,
                              sort_order: parseInt(e.target.value) || 1,
                            }
                          : null
                      )
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief narrative or room atmosphere..."
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            description: e.target.value,
                          }
                        : null
                    )
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImage}
                  className="rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold text-white uppercase tracking-wider shadow-sm hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? It will be permanently removed from your catalog and storefront.`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
}
