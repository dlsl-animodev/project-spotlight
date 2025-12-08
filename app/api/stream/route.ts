import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import client from "@/libs/s3";

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // Get the range header for seeking support
    const range = request.headers.get("range");

    // First, get the object metadata to know the total size
    const headCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    });

    const headResponse = await client.send(headCommand);
    const fileSize = headResponse.ContentLength || 0;
    const contentType = headResponse.ContentType || "video/mp4";

    if (range) {
      // Parse the range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Get the specific range from R2
      const rangeCommand = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Range: `bytes=${start}-${end}`,
      });

      const rangeResponse = await client.send(rangeCommand);

      if (!rangeResponse.Body) {
        return NextResponse.json({ error: "No body" }, { status: 500 });
      }

      // Convert the stream to a web ReadableStream
      const stream = rangeResponse.Body.transformToWebStream();

      return new NextResponse(stream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } else {
      // No range requested, return the full file
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      });

      const response = await client.send(command);

      if (!response.Body) {
        return NextResponse.json({ error: "No body" }, { status: 500 });
      }

      const stream = response.Body.transformToWebStream();

      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Length": fileSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json(
      { error: "Failed to stream video" },
      { status: 500 }
    );
  }
}
