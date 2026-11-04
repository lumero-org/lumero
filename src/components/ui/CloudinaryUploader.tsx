"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Image as ImageIcon, RefreshCw } from "lucide-react";
import { ProductImage } from "@/types";
import { fileToDataUrl } from "@/lib/imageCompressor";
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
  folder = "lumero/products",
}: CloudinaryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // If maxImages === 1, direct replacement is allowed
    const isSingleReplace = maxImages === 1;
    const remainingSlots = isSingleReplace ? 1 : maxImages - images.length;

    if (!isSingleReplace && remainingSlots <= 0) {
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
          filesToUpload.length > 1
            ? `Uploading image ${i + 1} of ${filesToUpload.length}...`
            : "Uploading original image..."
        );

        const dataPayload = await fileToDataUrl(file);

        const res = await fetch("/api/cloudinary/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataPayload,
            folder,
            isCompressed: false,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to upload image");
        }

        newUploadedImages.push({
          url: data.url,
          public_id: data.public_id,
        });
      }

      if (isSingleReplace) {
        onChange(newUploadedImages);
      } else {
        onChange([...images, ...newUploadedImages]);
      }

      toast.success(
        isSingleReplace
          ? "Image updated successfully"
          : `Uploaded ${newUploadedImages.length} image${newUploadedImages.length > 1 ? "s" : ""}`
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

  // Immediate, non-blocking image removal
  const handleRemoveImage = (imgToRemove: ProductImage) => {
    // 1. Immediately update UI state
    const updated = images.filter((img) => img.url !== imgToRemove.url);
    onChange(updated);
    toast.info("Image removed");

    // 2. Background cleanup from Cloudinary without blocking UI
    if (
      imgToRemove.public_id &&
      !imgToRemove.url.includes("unsplash") &&
      !imgToRemove.public_id.includes("unsplash")
    ) {
      fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: imgToRemove.public_id }),
      }).catch((e) => console.warn("Asset purge notice:", e));
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1.5 font-medium text-stone-700">
          <ImageIcon className="h-3.5 w-3.5 text-stone-400" />
          Images ({images.length}/{maxImages})
        </span>
        <span className="text-stone-500 text-[11px]">Original resolution (No compression)</span>
      </div>

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={img.public_id || index}
            className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-xs transition hover:shadow-sm"
          >
            <Image
              src={img.url}
              alt={`Asset ${index + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 20vw"
            />

            {index === 0 && maxImages > 1 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-stone-900/80 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}

            {/* Instant Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(img)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-950/80 text-white transition hover:bg-rose-600 shadow-sm cursor-pointer z-10"
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Trigger Button when slot is empty */}
        {images.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-center transition hover:border-stone-500 hover:bg-stone-50/50 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
            ) : (
              <UploadCloud className="h-6 w-6 text-stone-400" />
            )}
            <span className="mt-2 text-xs font-medium text-stone-700">
              {isUploading ? "Uploading..." : "Upload Image"}
            </span>
            <span className="text-[10px] text-stone-400">Click to browse</span>
          </button>
        )}

        {/* When maxImages === 1 and an image already exists: Always show a Replace button */}
        {maxImages === 1 && images.length === 1 && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-3 text-center transition hover:border-amber-600 hover:bg-amber-50/30 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
            ) : (
              <RefreshCw className="h-5 w-5 text-amber-700" />
            )}
            <span className="mt-1 text-[11px] font-semibold text-stone-800">
              {isUploading ? "Uploading..." : "Replace Photo"}
            </span>
            <span className="text-[9px] text-stone-500">Upload new</span>
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
        accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
        multiple={maxImages > 1}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
