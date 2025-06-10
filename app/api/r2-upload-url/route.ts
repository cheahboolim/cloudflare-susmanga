// app/api/r2-upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { url: remoteUrl } = (await req.json()) as { url: string };
    if (!remoteUrl) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // 1) Download remote image (server‑side fetch, no CORS issues)
    const downloadRes = await fetch(remoteUrl);
    if (!downloadRes.ok) {
      return NextResponse.json(
        { error: `Failed to download ${remoteUrl}` },
        { status: 502 }
      );
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2) Generate a filename and upload to R2
    const ext = remoteUrl.split(".").pop()?.split("?")[0] || "jpg";
    const key = `${crypto.randomUUID()}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: downloadRes.headers.get("content-type") || `image/${ext}`,
    });
    await r2.send(cmd);

    // 3) Return your CDN URL
    const cdnBase = process.env.CDN_BASE_URL || "";
    const cdnUrl = `${cdnBase}/${key}`;

    return NextResponse.json({ url: cdnUrl });
  } catch (err: any) {
    console.error("r2-upload-url error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
