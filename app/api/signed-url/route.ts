import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client from "@/libs/s3";

// In-memory cache for signed URLs (server-side)
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION = 3000; // 50 minutes (less than 1 hour expiry)

export async function GET(request: Request) {
  try {
    const urlObj = new URL(request.url);
    const key = urlObj.searchParams.get("key");
    if (!key) {
      return NextResponse.json(
        { error: "Missing 'key' parameter" },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = urlCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(
        { url: cached.url },
        {
          headers: {
            "Cache-Control": "public, max-age=3000, stale-while-revalidate=600",
          },
        }
      );
    }

    const cmd = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    });
    const signed = await getSignedUrl(client, cmd, { expiresIn: 3600 });

    // Store in cache
    urlCache.set(key, {
      url: signed,
      expiresAt: Date.now() + CACHE_DURATION * 1000,
    });

    return NextResponse.json(
      { url: signed },
      {
        headers: {
          "Cache-Control": "public, max-age=3000, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
