"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "@/components/comic-grid";
import { Button } from "@/components/ui/button";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const [comics, setComics] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchComics = async () => {
      if (!query) return;

      const { data: manga, error: mangaError } = await supabase
        .from("manga")
        .select("id, title, feature_image_url, artists")
        .ilike("title", `%${query}%`);

      const { data: slugs, error: slugError } = await supabase
        .from("slug_map")
        .select("slug, manga_id");

      if (mangaError || slugError) {
        console.error(
          "Error fetching search results:",
          mangaError || slugError
        );
        return;
      }

      const formatted = manga.map((item) => ({
        id: item.id,
        title: item.title,
        slug: slugs?.find((s) => s.manga_id === item.id)?.slug ?? "",
        featureImage: item.feature_image_url,
        author: { name: item.artists?.[0] ?? "Unknown" },
      }));

      setComics(formatted);
    };

    fetchComics();
  }, [query]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setLoading(false);
    }, 1000);
  };

  if (!query) {
    return (
      <p className="text-muted-foreground">Enter a search term to begin.</p>
    );
  }

  if (comics.length === 0) {
    return (
      <p className="text-muted-foreground">No results found for “{query}”.</p>
    );
  }

  return (
    <div>
      <ComicGrid comics={comics.slice(0, visibleCount)} />
      {visibleCount < comics.length && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
