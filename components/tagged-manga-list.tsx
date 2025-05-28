"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "@/components/comic-grid";
import { Button } from "@/components/ui/button";

type Comic = {
  id: string;
  title: string;
  slug: string;
  featureImage: string;
  author: { name: string };
};

export function TaggedMangaList({ tag }: { tag: string }) {
  const supabase = createClient();
  const [comics, setComics] = useState<Comic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadManga = async (page: number) => {
    setLoading(true);
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data: manga, error } = await supabase
      .from("manga")
      .select("id, title, feature_image_url, artists, tags")
      .contains("tags", [tag])
      .range(offset, offset + limit - 1);

    if (error || !manga || manga.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const ids = manga.map((m) => m.id);
    const { data: slugs } = await supabase
      .from("slug_map")
      .select("slug, manga_id")
      .in("manga_id", ids);

    const formatted = manga.map((item) => ({
      id: item.id,
      title: item.title,
      slug: slugs?.find((s) => s.manga_id === item.id)?.slug ?? "",
      featureImage: item.feature_image_url,
      author: { name: item.artists?.[0] ?? "Unknown" },
    }));

    setComics((prev) => [...prev, ...formatted]);
    setHasMore(manga.length === limit);
    setLoading(false);
  };

  useEffect(() => {
    loadManga(page);
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <ComicGrid comics={comics} />

      {hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
