"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "./comic-grid";

export function OthersAreEnjoying() {
  const [comics, setComics] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchPopular = async () => {
      const { data: manga, error } = await supabase
        .from("manga")
        .select("id, title, feature_image_url, artists")
        .order("created_at", { ascending: false }) // Or order by views if you have it
        .limit(10);

      const { data: slugs } = await supabase
        .from("slug_map")
        .select("slug, manga_id");

      if (error) {
        console.error("Error fetching popular manga:", error);
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

    fetchPopular();
  }, []);

  if (comics.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Others Are Enjoying</h2>
      <ComicGrid comics={comics} />
    </section>
  );
}
