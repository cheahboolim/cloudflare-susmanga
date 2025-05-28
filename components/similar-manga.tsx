"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "./comic-grid";

interface SimilarMangaProps {
  tagIds: number[];
  currentMangaId: string;
}

interface Manga {
  id: string;
  title: string;
  feature_image_url: string;
}

interface SlugMap {
  manga_id: string;
  slug: string;
}

export function SimilarManga({ tagIds, currentMangaId }: SimilarMangaProps) {
  const [comics, setComics] = useState<
    {
      id: string;
      title: string;
      featureImage: string;
      slug: string;
      author: { name: string };
    }[]
  >([]);
  const supabase = createClient();

  useEffect(() => {
    if (tagIds.length === 0) return;

    const fetchSimilar = async () => {
      // Step 1: Get manga_ids from manga_tags with shared tagIds
      const { data: relatedIdsData, error: relatedIdsError } = await supabase
        .from("manga_tags")
        .select("manga_id")
        .in("tag_id", tagIds);

      if (relatedIdsError || !relatedIdsData) {
        console.error("Failed to fetch related manga_ids", relatedIdsError);
        return;
      }

      const relatedMangaIds = Array.from(
        new Set(relatedIdsData.map((t) => t.manga_id))
      ).filter((id) => id !== currentMangaId);

      if (relatedMangaIds.length === 0) return;

      // Step 2: Get manga details
      const { data: mangas, error: mangaError } = await supabase
        .from("manga")
        .select("id, title, feature_image_url")
        .in("id", relatedMangaIds)
        .limit(10);

      if (mangaError || !mangas) {
        console.error("Failed to fetch similar manga", mangaError);
        return;
      }

      // Step 3: Get slugs
      const { data: slugs } = await supabase
        .from("slug_map")
        .select("slug, manga_id");

      const formatted = mangas.map((item) => ({
        id: item.id,
        title: item.title,
        slug: slugs?.find((s: SlugMap) => s.manga_id === item.id)?.slug ?? "",
        featureImage: item.feature_image_url,
        author: { name: "Unknown" },
      }));

      setComics(formatted);
    };

    fetchSimilar();
  }, [tagIds, currentMangaId]);

  if (comics.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Similar Manga You Might Like</h2>
      <ComicGrid comics={comics} />
    </section>
  );
}
