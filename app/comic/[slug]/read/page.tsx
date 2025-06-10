"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const IMAGES_PER_PAGE = 3;

export default function ComicReaderPage() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse page param safely and clamp to valid range
  const rawPage = Number(searchParams.get("page") ?? "1");
  const [comic, setComic] = useState<{ title: string; pages: string[] } | null>(
    null
  );

  const supabase = createClient();

  // Zero-based page index, never less than 0
  const page = Math.max(rawPage - 1, 0);
  const currentPage = page + 1;

  // Fetch comic data (title + pages)
  useEffect(() => {
    const fetchComicPages = async () => {
      const { data: slugRow, error: slugError } = await supabase
        .from("slug_map")
        .select("manga_id")
        .eq("slug", slug)
        .single();

      if (slugError || !slugRow) {
        console.error("Failed to load slug_map:", slugError);
        return;
      }

      const { data: manga, error: mangaError } = await supabase
        .from("manga")
        .select("title")
        .eq("id", slugRow.manga_id)
        .single();

      if (mangaError || !manga) {
        console.error("Failed to load manga:", mangaError);
        return;
      }

      const { data: pageRows, error: pageError } = await supabase
        .from("pages")
        .select("image_url, page_number")
        .eq("manga_id", slugRow.manga_id)
        .order("page_number", { ascending: true });

      if (pageError || !pageRows) {
        console.error("Failed to load pages:", pageError);
        return;
      }

      setComic({
        title: manga.title,
        pages: pageRows.map((p) => p.image_url),
      });
    };

    fetchComicPages();
  }, [slug, supabase]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Redirect if page number is out of range after comic loads
  useEffect(() => {
    if (!comic) return;

    const totalPages = Math.ceil(comic.pages.length / IMAGES_PER_PAGE);
    if (rawPage < 1) {
      router.replace(`/comic/${slug}/read?page=1`);
    } else if (rawPage > totalPages) {
      router.replace(`/comic/${slug}/read?page=${totalPages}`);
    }
  }, [rawPage, comic, router, slug]);

  if (!comic) {
    return <p className="text-center py-10">Loading...</p>;
  }

  const totalPages = Math.ceil(comic.pages.length / IMAGES_PER_PAGE);

  const pageImages = comic.pages.slice(
    page * IMAGES_PER_PAGE,
    (page + 1) * IMAGES_PER_PAGE
  );

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      router.push(`/comic/${slug}/read?page=${pageNumber}`);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/comic/${slug}`}
          className="text-lg font-medium hover:underline"
        >
          ← Back to {comic.title}
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{comic.title}</h1>

        <div className="space-y-4 mb-12">
          {pageImages.map((url, index) => (
            <div key={index} className="w-full mb-4">
              <Image
                src={url}
                alt={`Page ${index + 1 + page * IMAGES_PER_PAGE}`}
                width={800}
                height={1200}
                className="w-full rounded-lg"
                unoptimized // <-- added here
              />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ backgroundColor: "#FF1493", color: "white" }}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  variant="secondary"
                  onClick={() => goToPage(pageNum)}
                  className={`text-black ${
                    isActive
                      ? "bg-white border border-black"
                      : "bg-white/90 hover:bg-white"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ backgroundColor: "#FF1493", color: "white" }}
            >
              Next
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
          <Link href={`/comic/${slug}`}>
            <Button variant="secondary" className="bg-white text-black">
              Back to Gallery
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="bg-white text-black">
              Back to SusManga.com
            </Button>
          </Link>
        </div>

        {/* Scroll to top button */}
        <div className="sticky bottom-8 flex justify-center">
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full border shadow-lg">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
