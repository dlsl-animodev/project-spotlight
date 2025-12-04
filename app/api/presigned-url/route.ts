import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function POST(request: Request) {
  try {
    const { filename, contentType, folder } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Determine the key based on folder type
    const folderPath = folder || "videos";
    const key = `${folderPath}/${sanitizedFilename}`;

    // Create presigned URL for PUT operation (upload)
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    // URL expires in 1 hour (3600 seconds)
    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      presignedUrl,
      key,
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
