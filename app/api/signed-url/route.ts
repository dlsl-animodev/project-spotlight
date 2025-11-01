import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import client from "@/libs/s3";

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
    const cmd = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    });
    const signed = await getSignedUrl(client, cmd, { expiresIn: 3600 });
    return NextResponse.json({ url: signed });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
