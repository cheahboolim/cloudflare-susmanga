// app/browse/[type]/[slug]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { ComicGrid } from "@/components/comic-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";

export default async function BrowseByMetadataPage({
  params,
  searchParams,
}: {
  params: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const type = params.type;
  const slug = params.slug;

  // Pagination setup
  const page = Number((searchParams?.page as string) || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Allowed metadata types
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

  // Map metadata type to join table
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

  // Helper: singular form of metadata type
  function singular(t: string) {
    if (t.endsWith("ies")) return t.slice(0, -3) + "y";
    return t.slice(0, -1);
  }
  const metadataIdField = `${singular(type)}_id`;

  // Fetch metadata row by slug
  const { data: metadataRow, error: metadataError } = await supabase
    .from(type)
    .select("id")
    .eq("slug", slug)
    .single();
  if (metadataError || !metadataRow) return notFound();

  // Fetch related manga IDs from join table
  const { data: relatedMangaIds, error: relationError } = await supabase
    .from(metadataTable)
    .select("manga_id")
    .eq(metadataIdField, metadataRow.id)
    .limit(1000);
  if (relationError || !relatedMangaIds) return notFound();

  const mangaIds = relatedMangaIds.map((r) => r.manga_id);
  if (mangaIds.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          Browse {type} ➝ <span className="text-pink-500">{slug}</span>
        </h1>
        <p className="text-muted-foreground">No manga found.</p>
      </main>
    );
  }

  // Fetch manga data
  const { data: manga, error: mangaError } = await supabase
    .from("manga")
    .select("id, title, feature_image_url")
    .in("id", mangaIds)
    .range(offset, offset + pageSize - 1);
  if (mangaError || !manga) return notFound();

  // Fetch slugs
  const { data: slugs } = await supabase
    .from("slug_map")
    .select("slug, manga_id");

  // Format for ComicGrid
  const formatted = manga.map((item) => {
    const foundSlug = slugs?.find((s) => s.manga_id === item.id)?.slug;
    return {
      id: item.id,
      title: item.title,
      slug: foundSlug ?? "",
      featureImage: item.feature_image_url,
      author: { name: "Unknown" },
    };
  });
  const filtered = formatted.filter((m) => m.slug);

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        Browse {type} ➝ <span className="text-pink-500">{slug}</span>
      </h1>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No manga found.</p>
      ) : (
        <>
          <ComicGrid comics={filtered} />

          {/* Pagination */}
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
            {offset + pageSize < mangaIds.length && (
              <Link
                href={`/browse/${type}/${slug}?page=${page + 1}`}
                className="px-4 py-2 text-white rounded hover:bg-[#ff1493]/90"
                style={{ backgroundColor: "#ff1493" }}
              >
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}

// Optional: dynamic SEO title
export const metadata: Metadata = {
  title: "Browse by " + (process.env.NEXT_PUBLIC_SITE_NAME ?? "SusManga"),
};
