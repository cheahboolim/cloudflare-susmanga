// app/browse/[type]/[slug]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { ComicGrid } from "@/components/comic-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";

// ----- 1) Define the exact props shape -----
type PageProps = {
  params: {
    type: string;
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

// ----- 2) Export your metadata (unchanged) -----
export const metadata: Metadata = {
  title: "Browse by " + (process.env.NEXT_PUBLIC_SITE_NAME ?? "SusManga"),
};

// ----- 3) Use PageProps in the signature -----
export default async function BrowseByMetadataPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const { type, slug } = params;

  // Pagination
  const page = Number((searchParams?.page as string) || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Validate metadata type
  const allowedTypes = [
    "tags",
    "artists",
    "categories",
    "parodies",
    "characters",
    "languages",
    "groups",
  ];
  if (!allowedTypes.includes(type)) return notFound();

  // Map to join table
  const metadataTableMap: Record<string, string> = {
    tags: "manga_tags",
    artists: "manga_artists",
    categories: "manga_categories",
    parodies: "manga_parodies",
    characters: "manga_characters",
    languages: "manga_languages",
    groups: "manga_groups",
  };
  const metadataTable = metadataTableMap[type];

  // Singular helper
  function singular(t: string) {
    return t.endsWith("ies") ? t.slice(0, -3) + "y" : t.slice(0, -1);
  }
  const metadataIdField = `${singular(type)}_id`;

  // Fetch the metadata row
  const { data: metadataRow, error: metadataError } = await supabase
    .from(type)
    .select("id")
    .eq("slug", slug)
    .single();
  if (metadataError || !metadataRow) return notFound();

  // Fetch related manga IDs
  const { data: related, error: relError } = await supabase
    .from(metadataTable)
    .select("manga_id")
    .eq(metadataIdField, metadataRow.id)
    .limit(1000);
  if (relError || !related) return notFound();

  const allIds = related.map((r) => r.manga_id);
  const sliceIds = allIds.slice(offset, offset + pageSize);

  if (sliceIds.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          Browse {type} ➝ <span className="text-pink-500">{slug}</span>
        </h1>
        <p className="text-muted-foreground">No manga found.</p>
      </main>
    );
  }

  // Fetch manga entries
  const { data: manga, error: mangaError } = await supabase
    .from("manga")
    .select("id, title, feature_image_url")
    .in("id", sliceIds);
  if (mangaError || !manga) return notFound();

  // Fetch slugs
  const { data: slugs } = await supabase
    .from("slug_map")
    .select("slug, manga_id");

  // Format for ComicGrid
  const formatted = manga
    .map((item) => {
      const found = slugs?.find((s) => s.manga_id === item.id)?.slug;
      return found
        ? {
            id: item.id,
            title: item.title,
            slug: found,
            featureImage: item.feature_image_url,
            author: { name: "Unknown" },
          }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const totalPages = Math.ceil(allIds.length / pageSize);

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        Browse {type} ➝ <span className="text-pink-500">{slug}</span>
      </h1>

      <ComicGrid comics={formatted} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {page > 1 && (
            <Link
              href={`/browse/${type}/${slug}?page=${page - 1}`}
              className="px-4 py-2 text-white rounded hover:bg-[#ff1493]/90"
              style={{ backgroundColor: "#ff1493" }}
            >
              ← Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/browse/${type}/${slug}?page=${page + 1}`}
              className="px-4 py-2 text-white rounded hover:bg-[#ff1493]/90"
              style={{ backgroundColor: "#ff1493" }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
