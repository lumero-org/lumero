"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Layers } from "lucide-react";
import { getCategories, saveCategory, deleteCategory } from "@/lib/store";
import { Category } from "@/types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory({
      id: `cat_${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      icon: "✨",
      sort_order: categories.length + 1,
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory({ ...c });
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      toast.error("Category name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const slug =
        editingCategory.slug ||
        editingCategory.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const full: Category = {
        id: editingCategory.id || slug,
        name: editingCategory.name,
        slug,
        description: editingCategory.description || "",
        icon: editingCategory.icon || "✨",
        sort_order: Number(editingCategory.sort_order) || 1,
      };

      await saveCategory(full);
      toast.success("Category Saved", { description: `${full.name} has been updated.` });
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
        description: `Removed ${categoryToDelete.name} from catalog structure.`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-800">
            Structure & Taxonomy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-950 mt-0.5">
            Categories ({categories.length})
          </h1>
          <p className="text-xs text-stone-500">
            Organize interior pieces by atmosphere, lighting, plants and storage.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-stone-800 transition shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 py-12 text-center text-xs text-stone-400">
            Loading categories...
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-5 border border-stone-200 shadow-2xs hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{c.icon || "✨"}</span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                    Order #{c.sort_order}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-base font-medium text-stone-900">
                  {c.name}
                </h3>
                <span className="text-[11px] font-mono text-stone-400">
                  slug: /{c.slug}
                </span>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed font-light line-clamp-2">
                  {c.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition"
                  title="Edit Category"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCategoryToDelete(c)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsEditorOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <h3 className="font-serif text-base font-medium text-stone-900">
                {editingCategory.slug ? "Edit Category" : "New Category"}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sculpted Ceramic Vessels"
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    placeholder="🪴 or 💡"
                    value={editingCategory.icon || ""}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, icon: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
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
                      setEditingCategory({
                        ...editingCategory,
                        sort_order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Atmosphere and curated selections..."
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-stone-950 px-5 py-2 text-xs font-semibold text-white uppercase tracking-wider shadow-sm hover:bg-stone-800"
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
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? Products assigned to this category will become uncategorized.`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
}

