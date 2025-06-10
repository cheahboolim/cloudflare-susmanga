"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type Manga = {
  id: string;
  title: string;
  feature_image_url: string | null;
  created_at: string;
  slug_map: { slug: string }[]; // ensure 'slug' is typed
};

export default function MangaPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  async function fetchPosts() {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("manga")
      .select("id, title, feature_image_url, created_at, slug_map(slug)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching manga:", error);
    } else {
      setPosts(data as Manga[]);
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    const confirmed = confirm("Are you sure you want to delete this manga?");
    if (!confirmed) return;

    const joinTables = [
      "manga_tags",
      "manga_artists",
      "manga_groups",
      "manga_parodies",
      "manga_languages",
      "manga_categories",
      "manga_characters",
    ];

    for (const table of joinTables) {
      await supabase.from(table).delete().eq("manga_id", id);
    }

    await supabase.from("pages").delete().eq("manga_id", id);
    await supabase.from("slug_map").delete().eq("manga_id", id);
    await supabase.from("manga").delete().eq("id", id);

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manga Posts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => {
            const slug = post.slug_map?.[0]?.slug;
            return (
              <div
                key={post.id}
                className="border rounded p-4 flex items-start gap-4"
              >
                {post.feature_image_url && (
                  <img
                    src={post.feature_image_url}
                    alt="Feature"
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {slug ? (
                      <Link href={`/comic/${slug}`}>{post.title}</Link>
                    ) : (
                      post.title
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleDelete(post.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={posts.length < PAGE_SIZE}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
