import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${uuidv4()}-${file.name}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await r2.send(command);

    // Use your CDN base URL here (no /manga/ folder)
    const cdnBaseUrl = process.env.CDN_BASE_URL || '';
    const url = `${cdnBaseUrl}/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 });
  }
}
