// app/api/newupload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";

// Initialize your Cloudflare R2 client
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// 1) Define and validate the incoming payload schema
const uploadSchema = z.object({
  mangaId: z.string().optional().nullable(),
  title: z.string().min(1),
  featureImageUrl: z.string().url().optional().nullable(),
  pageUrls: z.array(z.string().url()).min(1),
  artists: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  parodies: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  categories: z.string().optional().nullable(),
  groups: z.string().optional().nullable(),
  characters: z.string().optional().nullable(),
});

function slugify(text: string) {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-") || "untitled"
  );
}

// 2) Helper: download a remote image & upload it to R2
async function downloadAndUploadToR2(remoteUrl: string, key: string): Promise<string> {
  // Server‐side fetch (no CORS issues)
  const downloadRes = await fetch(remoteUrl);
  if (!downloadRes.ok) {
    throw new Error(`Failed to download ${remoteUrl}`);
  }

  // Read into a Buffer
  const arrayBuffer = await downloadRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = downloadRes.headers.get("content-type") || undefined;

  // Upload to R2
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  // Return the CDN URL
  const cdnBase = process.env.CDN_BASE_URL || "";
  return `${cdnBase}/${key}`;
}

export async function POST(req: NextRequest) {
  // Await your Supabase client
  const supabase = await createClient();

  // Parse JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate with Zod
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const {
    mangaId,
    title,
    featureImageUrl,
    pageUrls,
    artists,
    tags,
    parodies,
    languages,
    categories,
    groups,
    characters,
  } = parsed.data;

  try {
    // Prepare folder & slug
    const slugBase = slugify(title);
    const folder = `manga/${slugBase}`;

    // 3) Re‐upload feature image (if given)
    const cdnFeatureUrl = featureImageUrl
      ? await downloadAndUploadToR2(
          featureImageUrl,
          `${folder}/feat-${randomUUID()}.${featureImageUrl.split(".").pop()?.split("?")[0]}`
        )
      : null;

    // 4) Re‐upload pages, in order
    const cdnPageUrls: string[] = [];
    for (let i = 0; i < pageUrls.length; i++) {
      const remote = pageUrls[i];
      const ext = remote.split(".").pop()?.split("?")[0] || "jpg";
      const key = `${folder}/page-${i + 1}-${randomUUID()}.${ext}`;
      const url = await downloadAndUploadToR2(remote, key);
      cdnPageUrls.push(url);
    }

    // 5) Insert into 'manga'
    const { data: mangaData, error: mangaErr } = await supabase
      .from("manga")
      .insert({
        id: randomUUID(),
        manga_id: mangaId || null,
        title: title.trim(),
        feature_image_url: cdnFeatureUrl,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (mangaErr || !mangaData?.id) {
      throw mangaErr || new Error("Failed to insert manga");
    }
    const newMangaId = mangaData.id;

    // 6) Insert into 'slug_map'
    await supabase.from("slug_map").insert({ slug: slugBase, manga_id: newMangaId });

    // 7) Insert pages
    await supabase.from("pages").insert(
      cdnPageUrls.map((url, idx) => ({
        manga_id: newMangaId,
        page_number: idx + 1,
        image_url: url,
      }))
    );

    // 8) Upsert & link metadata
    const upsertAndLink = async (
      table: string,
      joinTable: string,
      raw?: string | null
    ) => {
      if (!raw) return;
      const names = raw.split(",").map((s) => s.trim()).filter(Boolean);
      for (const name of names) {
        // Upsert the entity
        const { data: existing } = await supabase
          .from(table)
          .select("id")
          .eq("name", name)
          .maybeSingle();
        const entityId =
          existing?.id ||
          (
            await supabase
              .from(table)
              .insert({ name, slug: slugify(name) })
              .select("id")
              .single()
          ).data?.id;
        if (entityId) {
          // Link in the join table
          const col = `${table.slice(0, -1)}_id`; // e.g. 'tags' → 'tag_id'
          await supabase
            .from(joinTable)
            .insert({ manga_id: newMangaId, [col]: entityId });
        }
      }
    };

    await Promise.all([
      upsertAndLink("artists", "manga_artists", artists),
      upsertAndLink("tags", "manga_tags", tags),
      upsertAndLink("parodies", "manga_parodies", parodies),
      upsertAndLink("languages", "manga_languages", languages),
      upsertAndLink("categories", "manga_categories", categories),
      upsertAndLink("groups", "manga_groups", groups),
      upsertAndLink("characters", "manga_characters", characters),
    ]);

    return NextResponse.json({ success: true, id: newMangaId, slug: slugBase });
  } catch (err: any) {
    console.error("newupload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload manga." },
      { status: 500 }
    );
  }
}
