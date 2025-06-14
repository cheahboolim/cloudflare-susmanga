"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ComicGrid } from "@/components/comic-grid";
import { ComicCardSkeleton } from "@/components/comic-skeleton";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export function LatestComics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);

  const [comics, setComics] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const {
        data: manga,
        error: mangaError,
        count,
      } = await supabase
        .from("manga")
        .select("id, title, feature_image_url", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (mangaError || !manga) {
        console.error("Error fetching manga:", mangaError);
        setLoading(false);
        return;
      }

      const mangaIds = manga.map((m) => m.id);

      const { data: slugs, error: slugError } = await supabase
        .from("slug_map")
        .select("slug, manga_id")
        .in("manga_id", mangaIds);

      if (slugError || !slugs) {
        console.error("Error fetching slugs:", slugError);
        setLoading(false);
        return;
      }

      const formatted = manga.map((item) => ({
        id: item.id,
        title: item.title,
        slug: slugs.find((s) => s.manga_id === item.id)?.slug ?? "",
        featureImage: item.feature_image_url,
        author: { name: "Unknown" },
      }));

      setComics(formatted);
      setTotal(count ?? 0);
      setLoading(false);
    };

    fetchComics();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      router.push(`/?page=${p}`);
    }
  };

  return (
    <div className="py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Popular Right Now</h2>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ComicCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <ComicGrid comics={comics} />

          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{
                backgroundColor: "#FF1493",
                color: "white",
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </Button>

            <Button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              style={{
                backgroundColor: "#FF1493",
                color: "white",
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
