import { NextResponse } from "next/server";
import { ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function GET() {
  try {
    let totalSize = 0;
    let totalObjects = 0;
    let continuationToken: string | undefined = undefined;

    // List all objects and sum their sizes
    do {
      const response: ListObjectsV2CommandOutput = await client.send(
        new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET!,
          ContinuationToken: continuationToken,
        })
      );

      const objects = response.Contents || [];
      totalObjects += objects.length;
      totalSize += objects.reduce((sum, obj) => sum + (obj.Size || 0), 0);

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Calculate in different units
    const totalSizeBytes = totalSize;
    const totalSizeMB = totalSize / (1024 * 1024);
    const totalSizeGB = totalSize / (1024 * 1024 * 1024);

    // R2 free tier limit is 10GB
    const FREE_TIER_LIMIT_GB = 10;
    const usagePercentage = (totalSizeGB / FREE_TIER_LIMIT_GB) * 100;
    const remainingGB = FREE_TIER_LIMIT_GB - totalSizeGB;

    return NextResponse.json({
      totalObjects,
      totalSizeBytes,
      totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
      totalSizeGB: parseFloat(totalSizeGB.toFixed(3)),
      freeTierLimitGB: FREE_TIER_LIMIT_GB,
      usagePercentage: parseFloat(usagePercentage.toFixed(2)),
      remainingGB: parseFloat(remainingGB.toFixed(3)),
      isNearLimit: usagePercentage > 80,
      isOverLimit: totalSizeGB >= FREE_TIER_LIMIT_GB,
    });
  } catch (error) {
    console.error("Error getting bucket stats:", error);
    return NextResponse.json(
      { error: "Failed to get bucket statistics" },
      { status: 500 }
    );
  }
}
