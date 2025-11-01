import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function GET() {
  try {
    const results = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
        MaxKeys: 1000,
      })
    );

    const items = (results.Contents ?? [])
      .filter((obj) => Boolean(obj.Key))
      .filter((obj) => !obj.Key!.endsWith("/"))
      .map((obj) => ({
        key: obj.Key!,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified?.toISOString() ?? null,
      }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("list-videos error:", err);
    return NextResponse.json(
      { error: "failed to list videos" },
      { status: 500 }
    );
  }
}
