import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ComicPreview } from "@/components/comic-preview";
import { createClient } from "@/utils/supabase/server";
import { SimilarManga } from "@/components/similar-manga";

type RelatedMeta = {
  id: string;
  name: string;
  slug: string;
};

type ComicData = {
  id: string;
  title: string;
  feature_image_url: string | null;
  publishedAt: string;
  previewImages: string[];
  artists: RelatedMeta[];
  tags: RelatedMeta[];
  groups: RelatedMeta[];
  categories: RelatedMeta[];
  languages: RelatedMeta[];
  parodies: RelatedMeta[];
};

async function getComicBySlug(slug: string): Promise<ComicData | null> {
  const supabase = await createClient();

  const { data: slugRow, error: slugErr } = await supabase
    .from("slug_map")
    .select("manga_id")
    .eq("slug", slug)
    .single();

  if (slugErr || !slugRow) return null;

  const mangaId = slugRow.manga_id;

  const { data: manga, error: mangaErr } = await supabase
    .from("manga")
    .select("id, title, feature_image_url, created_at")
    .eq("id", mangaId)
    .single();

  if (mangaErr || !manga) return null;

  const { data: pages }: { data: { image_url: string }[] | null } =
    await supabase
      .from("pages")
      .select("image_url")
      .eq("manga_id", mangaId)
      .order("page_number", { ascending: true })
      .limit(4);

  async function fetchRelated(
    joinTable: string,
    foreignKey: string
  ): Promise<RelatedMeta[]> {
    const { data: joinRows } = await supabase
      .from(joinTable)
      .select(`${foreignKey}(id, name, slug)`)
      .eq("manga_id", mangaId);

    if (!joinRows) return [];

    return joinRows
      .map((row: any) => row[foreignKey])
      .filter(Boolean)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
      }));
  }

  const [artists, tags, groups, categories, languages, parodies] =
    await Promise.all([
      fetchRelated("manga_artists", "artist_id"),
      fetchRelated("manga_tags", "tag_id"),
      fetchRelated("manga_groups", "group_id"),
      fetchRelated("manga_categories", "category_id"),
      fetchRelated("manga_languages", "language_id"),
      fetchRelated("manga_parodies", "parody_id"),
    ]);

  return {
    id: manga.id,
    title: manga.title,
    feature_image_url: manga.feature_image_url,
    publishedAt: manga.created_at,
    previewImages: pages?.map((p) => p.image_url) ?? [],
    artists,
    tags,
    groups,
    categories,
    languages,
    parodies,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const comic = await getComicBySlug(params.slug);
  if (!comic) {
    return {
      title: "Comic not found | SusManga",
      description: "This comic does not exist.",
    };
  }
  return {
    title: `${comic.title} | SusManga`,
    description: `Read ${comic.title} on SusManga.`,
    openGraph: {
      images: comic.feature_image_url ? [comic.feature_image_url] : [],
    },
  };
}

export default async function ComicDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const comic = await getComicBySlug(params.slug);

  if (!comic) return notFound();

  function renderLinks(type: string, items: RelatedMeta[]) {
    if (!items.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map(({ id, name, slug }) => (
          <Link
            key={id}
            href={`/browse/${type}/${slug}`}
            className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground hover:bg-pink-100"
          >
            {name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {comic.feature_image_url && (
          <Link href={`/comic/${params.slug}/read`}>
            <Image
              src={comic.feature_image_url}
              alt={comic.title}
              width={600}
              height={900}
              priority
              className="w-full rounded-lg hover:opacity-90 transition"
            />
          </Link>
        )}

        <div>
          <h1 className="text-4xl font-bold mb-2">{comic.title}</h1>
          <div className="text-muted-foreground text-sm mb-4 flex items-center gap-2 flex-wrap">
            {comic.artists.length > 0 && (
              <>
                <span className="font-semibold">Artists:</span>
                {comic.artists.map(({ id, name, slug }) => (
                  <Link
                    key={id}
                    href={`/browse/artists/${slug}`}
                    className="underline hover:text-pink-500"
                  >
                    {name}
                  </Link>
                ))}
              </>
            )}
            <span>&middot;</span>
            <span>{new Date(comic.publishedAt).toLocaleDateString()}</span>
          </div>

          <div>
            <strong>Tags:</strong>
            {renderLinks("tags", comic.tags)}

            <strong>Groups:</strong>
            {renderLinks("groups", comic.groups)}

            <strong>Categories:</strong>
            {renderLinks("categories", comic.categories)}

            <strong>Languages:</strong>
            {renderLinks("languages", comic.languages)}

            <strong>Parodies:</strong>
            {renderLinks("parodies", comic.parodies)}
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="bg-[#FF1493] hover:bg-[#e01382] text-white"
        >
          <Link href={`/comic/${params.slug}/read`}>Start Reading</Link>
        </Button>

        {comic.previewImages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <ComicPreview
              images={comic.previewImages}
              comicSlug={params.slug}
            />
          </div>
        )}
      </div>

      {/* Add SimilarManga here under the main content */}
      <SimilarManga
        tagIds={comic.tags.map((tag) => Number(tag.id))}
        currentMangaId={comic.id}
      />
    </main>
  );
}
