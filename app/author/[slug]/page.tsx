import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Slugify helper (same logic used in comic detail)
function deslugify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Fetch all manga by this author
async function getMangaByAuthorSlug(slug: string) {
  const authorName = deslugify(slug);

  const { data: mangaList, error } = await supabase
    .from("manga")
    .select("id, title, feature_image_url, artists")
    .contains("artists", [authorName]);

  if (error || !mangaList) return null;

  // Get slugs for each manga
  const mangaIds = mangaList.map((m) => m.id);
  const { data: slugs } = await supabase
    .from("slug_map")
    .select("manga_id, slug")
    .in("manga_id", mangaIds);

  const slugMap = new Map(slugs?.map((s) => [s.manga_id, s.slug]));

  return mangaList.map((manga) => ({
    ...manga,
    slug: slugMap.get(manga.id) ?? null,
  }));
}

export default async function AuthorPage({
  params,
}: {
  params: { slug: string };
}) {
  const authorName = deslugify(params.slug);
  const mangaList = await getMangaByAuthorSlug(params.slug);

  if (!mangaList || mangaList.length === 0) return notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Manga by {authorName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mangaList.map((manga) => (
          <Link
            key={manga.id}
            href={manga.slug ? `/comic/${manga.slug}` : "#"}
            className="group"
          >
            <div className="rounded overflow-hidden shadow hover:shadow-lg transition">
              {manga.feature_image_url && (
                <Image
                  src={manga.feature_image_url}
                  alt={manga.title}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              )}
              <div className="p-3 bg-muted">
                <h2 className="text-lg font-semibold group-hover:text-primary transition">
                  {manga.title}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Button asChild>
          <Link href="/">← Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
