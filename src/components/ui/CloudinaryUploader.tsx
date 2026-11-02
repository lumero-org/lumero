"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { ProductImage } from "@/types";
import { compressProductImage, fileToDataUrlUncompressed } from "@/lib/imageCompressor";
import { ConfirmModal } from "./ConfirmModal";
import { toast } from "sonner";

interface CloudinaryUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  isProduct?: boolean;
  folder?: string;
}

export function CloudinaryUploader({
  images,
  onChange,
  maxImages = 5,
  isProduct = true,
  folder = "lumero/products",
}: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.warning(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const newUploadedImages: ProductImage[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(
          isProduct
            ? `Compressing & uploading image ${i + 1} of ${filesToUpload.length}...`
            : `Uploading image ${i + 1} of ${filesToUpload.length}...`
        );

        let dataPayload: string;
        if (isProduct) {
          // Compress product images specifically on client side
          dataPayload = await compressProductImage(file, 1600, 1600, 0.82);
        } else {
          // Uncompressed for other sections / banners
          dataPayload = await fileToDataUrlUncompressed(file);
        }

        // Send to Cloudinary upload API
        const res = await fetch("/api/cloudinary/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataPayload,
            folder,
            isCompressed: isProduct,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to upload image to Cloudinary");
        }

        const data = await res.json();
        newUploadedImages.push({
          url: data.url,
          public_id: data.public_id,
        });
      }

      onChange([...images, ...newUploadedImages]);
      toast.success(
        `Uploaded ${newUploadedImages.length} image${newUploadedImages.length > 1 ? "s" : ""}`,
        {
          description: isProduct
            ? "Compressed and securely uploaded to Cloudinary."
            : "Uploaded to Cloudinary without compression.",
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error("Upload Failed", { description: msg });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);

    try {
      // Call Cloudinary delete API
      if (imageToDelete.public_id) {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: imageToDelete.public_id }),
        });
      }

      // Remove from state
      const updated = images.filter((img) => img.url !== imageToDelete.url);
      onChange(updated);
      toast.info("Image Removed", {
        description: "Deleted asset from Cloudinary storage.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion error";
      toast.error("Failed to delete", { description: msg });
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <ImageIcon className="h-4 w-4 text-stone-400" />
          Images ({images.length}/{maxImages})
        </span>
        {isProduct ? (
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200">
            <Sparkles className="h-3 w-3" />
            Client compression active (max 5)
          </span>
        ) : (
          <span className="text-stone-500 text-[11px]">Original resolution (No compression)</span>
        )}
      </div>

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((img, index) => (
          <div
            key={img.public_id || index}
            className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm transition hover:shadow"
          >
            <Image
              src={img.url}
              alt={`Asset ${index + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 20vw"
            />

            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-stone-900/80 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}

            <button
              type="button"
              onClick={() => setImageToDelete(img)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/80 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
              title="Remove and purge from Cloudinary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Trigger Button */}
        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-center transition hover:border-stone-500 hover:bg-stone-50/50 disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
            ) : (
              <UploadCloud className="h-6 w-6 text-stone-400" />
            )}
            <span className="mt-2 text-xs font-medium text-stone-700">
              {isUploading ? "Uploading..." : "Add Image"}
            </span>
            <span className="text-[10px] text-stone-400">
              {maxImages - images.length} remaining
            </span>
          </button>
        )}
      </div>

      {uploadProgress && (
        <div className="flex items-center gap-2 text-xs text-stone-600 animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-600" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxImages > 1}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(imageToDelete)}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDeleteImage}
        title="Remove and Delete Image?"
        description="This will permanently delete this asset from Cloudinary storage and remove it from this item. This action cannot be reversed."
        confirmText="Delete from Cloudinary"
        isLoading={isDeleting}
      />
    </div>
  );
}

