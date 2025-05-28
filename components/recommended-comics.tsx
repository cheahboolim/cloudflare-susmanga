"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "@/components/comic-grid";

export function RecommendedComics() {
  const [comics, setComics] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecommended() {
      const { data: manga, error: mangaError } = await supabase
        .from("manga")
        .select("id, title, feature_image_url")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: slugs, error: slugError } = await supabase
        .from("slug_map")
        .select("slug, manga_id");

      if (mangaError || slugError) {
        console.error("Error fetching recommended:", mangaError || slugError);
        return;
      }

      // Format the manga without artists
      const formatted = manga.map((item) => ({
        id: item.id,
        title: item.title,
        slug: slugs?.find((s) => s.manga_id === item.id)?.slug ?? "",
        featureImage: item.feature_image_url,
        author: { name: "Unknown" }, // Provide a fallback author
      }));

      setComics(formatted);
    }

    fetchRecommended();
  }, []);

  return <ComicGrid comics={comics} />;
}
