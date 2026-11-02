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

export async function POST(req: NextRequest) {
  try {
    const { public_id, public_ids } = await req.json();

    const idsToDelete: string[] = [];
    if (public_id && typeof public_id === "string") {
      idsToDelete.push(public_id);
    }
    if (Array.isArray(public_ids)) {
      idsToDelete.push(...public_ids.filter((id) => typeof id === "string" && id.trim().length > 0));
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: "No public_id provided" }, { status: 400 });
    }

    const results = [];

    if (isConfigured) {
      for (const id of idsToDelete) {
        // Skip simulated local IDs
        if (id.startsWith("lumero_local_")) {
          results.push({ id, status: "skipped_local" });
          continue;
        }

        try {
          const res = await cloudinary.uploader.destroy(id);
          results.push({ id, result: res.result });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error deleting image";
          results.push({ id, error: msg });
        }
      }
    } else {
      for (const id of idsToDelete) {
        results.push({ id, result: "deleted_mock_session" });
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: idsToDelete.length,
      details: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete Cloudinary asset";
    console.error("Cloudinary deletion error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

