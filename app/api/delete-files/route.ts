import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function POST(request: NextRequest) {
  try {
    const { videoKey, thumbnailKey, coverphotoKey } = await request.json();

    console.log("Deleting files:", { videoKey, thumbnailKey, coverphotoKey });

    if (!videoKey && !thumbnailKey && !coverphotoKey) {
      return NextResponse.json({ error: "No keys provided" }, { status: 400 });
    }

    const deletePromises: Promise<unknown>[] = [];

    // Delete video file
    if (videoKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
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
            Bucket: process.env.R2_BUCKET!,
            Key: thumbnailKey,
          })
        )
      );
    }

    // Delete cover photo file
    if (coverphotoKey) {
      deletePromises.push(
        client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: coverphotoKey,
          })
        )
      );
    }

    await Promise.all(deletePromises);

    console.log("Successfully deleted files from R2");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting files from R2:", error);
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 }
    );
  }
}
