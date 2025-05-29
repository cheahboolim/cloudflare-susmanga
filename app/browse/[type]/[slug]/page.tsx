import { createClient } from "@/utils/supabase/server";
import { ComicGrid } from "@/components/comic-grid";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type BrowsePageParams = {
  type: string;
  slug: string;
};

type BrowseSearchParams = {
  page?: string;
};

interface PageProps {
  params: BrowsePageParams;
  searchParams: BrowseSearchParams;
}

export const metadata: Metadata = {
  title: "Browse Manga",
};

export default async function BrowseByMetadataPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createClient();
  const page = Number(searchParams.page || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const { type, slug } = params;

  const allowedTypes = [
    "tags",
    "artists",
    "categories",
    "parodies",
    "languages",
    "groups",
  ] as const;

  if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
    return notFound();
  }

  const metadataTableMap: Record<string, string> = {
    tags: "manga_tags",
    artists: "manga_artists",
    categories: "manga_categories",
    parodies: "manga_parodies",
    languages: "manga_languages",
    groups: "manga_groups",
  };

  const metadataTable = metadataTableMap[type];
  if (!metadataTable) return notFound();

  const { data: metadataRow, error: metadataError } = await supabase
    .from(type)
    .select("id")
    .eq("slug", slug)
    .single();

  if (metadataError || !metadataRow) return notFound();

  const metadataIdField = `${type.slice(0, -1)}_id`;

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

  const { data: manga, error: mangaError } = await supabase
    .from("manga")
    .select("id, title, feature_image_url")
    .in("id", mangaIds)
    .range(offset, offset + pageSize - 1);

  if (mangaError || !manga) return notFound();

  const { data: slugs } = await supabase
    .from("slug_map")
    .select("slug, manga_id");

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
        <ComicGrid comics={filtered} />
      )}
    </main>
  );
}
