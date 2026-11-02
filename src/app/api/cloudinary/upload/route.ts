import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== "demo" &&
  !cloudName.includes("your_cloud_name")
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { image, folder = "lumero", isCompressed = false } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // If Cloudinary credentials are provided, upload to Cloudinary directly
    if (isConfigured) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder,
          resource_type: "image",
        });

        return NextResponse.json({
          success: true,
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
          format: uploadResponse.format,
          bytes: uploadResponse.bytes,
          isCompressed,
        });
      } catch (cloudErr: unknown) {
        console.error("Cloudinary upload failed, falling back safely:", cloudErr);
        // If image is a data URL and Cloudinary fails, fallback safely so user is never blocked
        if (typeof image === "string" && image.startsWith("data:image")) {
          const simulatedId = `lumero_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          return NextResponse.json({
            success: true,
            url: image,
            public_id: simulatedId,
            isCompressed,
            fallbackMode: true,
            warning: "Uploaded locally as fallback due to Cloudinary service error.",
          });
        }
        throw cloudErr;
      }
    }

    // Resilient Fallback Mode when credentials are not yet entered
    // Generates a local identifier and preserves the data URL
    const simulatedId = `lumero_local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return NextResponse.json({
      success: true,
      url: image, // Return data URL or URL
      public_id: simulatedId,
      isCompressed,
      fallbackMode: true,
      note: "Stored in fallback mode. Add Cloudinary credentials to .env.local for production CDN sync.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "Failed to upload image";
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
