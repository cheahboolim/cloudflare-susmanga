"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const PAGE_SIZE = 20;

type Manga = {
  id: string;
  title: string;
  created_at: string;
};

export default function MangaPostsPage() {
  const supabase = createClient();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchMangas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchMangas = async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("manga")
      .select("id, title, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      alert("Error fetching mangas: " + error.message);
    } else if (data) {
      setMangas(data);
      setHasMore((count || 0) > to + 1);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this manga and all related data?"
      )
    )
      return;

    // Delete related data in parallel
    const results = await Promise.all([
      supabase.from("pages").delete().eq("manga_id", id),
      supabase.from("slug_map").delete().eq("manga_id", id),
      supabase.from("manga_tags").delete().eq("manga_id", id),
      supabase.from("manga_artists").delete().eq("manga_id", id),
      supabase.from("manga_parodies").delete().eq("manga_id", id),
      supabase.from("manga_groups").delete().eq("manga_id", id),
      supabase.from("manga_languages").delete().eq("manga_id", id),
      supabase.from("manga_categories").delete().eq("manga_id", id),
      // supabase.from("manga_characters").delete().eq("manga_id", id), // Uncomment if you have this table
    ]);

    // Check for errors
    const errors = results
      .map((res) => ("error" in res ? res.error : null))
      .filter(Boolean);
    if (errors.length) {
      alert(
        "Error deleting some related data: " +
          errors.map((e) => e?.message).join(", ")
      );
      return;
    }

    // Finally delete manga row
    const { error } = await supabase.from("manga").delete().eq("id", id);
    if (error) {
      alert("Error deleting manga: " + error.message);
      return;
    }

    // Refresh the list after deletion
    fetchMangas();
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Latest Manga Posts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : mangas.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul className="space-y-4">
          {mangas.map((manga) => (
            <li key={manga.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{manga.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(manga.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(manga.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore}
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
