import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ComicGrid } from "@/components/comic-grid";
import { Button } from "@/components/ui/button";

interface Manga {
  id: string;
  title: string;
  feature_image_url: string;
}

interface SlugMap {
  slug: string;
  manga_id: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q?.trim() || "";
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 20;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <p className="text-muted-foreground">Please enter a search term.</p>
      </div>
    );
  }

  const {
    data: manga,
    error: mangaError,
    count,
  } = await supabase
    .from("manga")
    .select("id, title, feature_image_url", { count: "exact" })
    .ilike("title", `%${query}%`)
    .range(from, to);

  if (mangaError || !manga) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Search Error</h1>
        <p className="text-muted-foreground">
          Sorry, we couldn't complete your search.
        </p>
      </div>
    );
  }

  const { data: slugs } = await supabase
    .from("slug_map")
    .select("slug, manga_id");

  const formatted = manga.map((item: Manga) => ({
    id: item.id,
    title: item.title,
    slug: slugs?.find((s: SlugMap) => s.manga_id === item.id)?.slug ?? "",
    featureImage: item.feature_image_url,
    author: { name: "Unknown" },
  }));

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">
        Search results for: <span className="text-pink-500">{query}</span>
      </h1>

      {formatted.length === 0 ? (
        <p className="text-muted-foreground">No comics found.</p>
      ) : (
        <>
          <ComicGrid comics={formatted} />

          {/* Pagination */}
          <div className="mt-10 flex flex-wrap gap-2 justify-center">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;

              return (
                <Link
                  key={pageNum}
                  href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className="bg-white text-black hover:bg-gray-200 dark:bg-white dark:text-black"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
