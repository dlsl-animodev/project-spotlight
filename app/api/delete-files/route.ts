import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function POST(request: NextRequest) {
  try {
    const { videoKey, thumbnailKey } = await request.json();

    if (!videoKey && !thumbnailKey) {
      return NextResponse.json({ error: "No keys provided" }, { status: 400 });
    }

    const deletePromises: Promise<unknown>[] = [];

    // Delete video file
    if (videoKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: videoKey,
          })
        )
      );
    }

    // Delete thumbnail file
    if (thumbnailKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: thumbnailKey,
          })
        )
      );
    }

    await Promise.all(deletePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting files from R2:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
}
