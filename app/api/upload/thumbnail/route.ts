import client from "@/libs/s3";
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const coverphotoFile = formData.get("coverphoto") as File | null;
    if (!thumbnailFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!coverphotoFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Store thumbnails in /thumbnails subfolder
    // Sanitize the title to create a clean filename
    const title = (formData.get("title") as string) || "untitled";
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    const thumbnailKey = `thumbnail/${sanitizedTitle}`;
    const coverphotoKey = `coverphoto/${sanitizedTitle}`;

    const thumbnailBytes = await thumbnailFile.arrayBuffer();
    const thumbnailBuffer = Buffer.from(thumbnailBytes);

    const coverphotoBytes = await coverphotoFile.arrayBuffer();
    const coverphotoBuffer = Buffer.from(coverphotoBytes);

    // Upload thumbnail to R2
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: thumbnailFile.type,
      })
    );

    // Upload cover photo to R2
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: coverphotoKey,
        Body: coverphotoBuffer,
        ContentType: coverphotoFile.type,
      })
    );

    return NextResponse.json({
      message: "Files uploaded successfully",
      thumbnailKey: thumbnailKey,
      coverphotoKey: coverphotoKey,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
