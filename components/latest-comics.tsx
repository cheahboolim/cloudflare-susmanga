"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ComicGrid } from "@/components/comic-grid";

export function LatestComics() {
  const [comics, setComics] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchComics = async () => {
      const { data: manga, error: mangaError } = await supabase
        .from("manga")
        .select("id, title, feature_image_url")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: slugs, error: slugError } = await supabase
        .from("slug_map")
        .select("slug, manga_id");

      if (mangaError || slugError) {
        console.error(
          "Error fetching manga or slugs:",
          mangaError || slugError
        );
        return;
      }

      const formatted = manga.map((item) => ({
        id: item.id,
        title: item.title,
        slug: slugs?.find((s) => s.manga_id === item.id)?.slug ?? "",
        featureImage: item.feature_image_url,
        author: { name: "Unknown" }, // dummy author to satisfy ComicGrid
      }));

      setComics(formatted);
    };

    fetchComics();
  }, []);

  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setLoading(false);
    }, 1000);
  };

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
