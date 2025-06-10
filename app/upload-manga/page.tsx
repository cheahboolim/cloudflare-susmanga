"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UploadMangaPage() {
  const supabase = createClient();

  const [mangaId, setMangaId] = useState("");
  const [title, setTitle] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [artists, setArtists] = useState("");
  const [tags, setTags] = useState("");
  const [parodies, setParodies] = useState("");
  const [languages, setLanguages] = useState("");
  const [categories, setCategories] = useState("");
  const [groups, setGroups] = useState("");
  const [characters, setCharacters] = useState(""); // NEW
  const [pagesText, setPagesText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function slugify(text: string) {
    if (!text) return "untitled";
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  }

  function parseList(input: string) {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function upsertEntity(table: string, name: string) {
    if (!name) return null;

    const { data: existing, error: fetchError } = await supabase
      .from(table)
      .select("id")
      .eq("name", name)
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existing?.id) return existing.id;

    const { data: inserted, error: insertError } = await supabase
      .from(table)
      .insert({ name, slug: slugify(name) })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return inserted?.id ?? null;
  }

  const joinTableEntityColumnMap: Record<string, string> = {
    manga_artists: "artist_id",
    manga_tags: "tag_id",
    manga_parodies: "parody_id",
    manga_languages: "language_id",
    manga_categories: "category_id",
    manga_groups: "group_id",
    manga_characters: "character_id", // NEW
  };

  async function linkMangaJoin(
    joinTable: string,
    mangaId: string,
    entityId: number | string | null
  ) {
    if (!entityId) return;

    const entityColumn = joinTableEntityColumnMap[joinTable];
    if (!entityColumn) throw new Error(`Unknown join table: ${joinTable}`);

    const { error } = await supabase.from(joinTable).insert({
      manga_id: mangaId,
      [entityColumn]: entityId,
    });

    if (error) throw error;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!title.trim()) throw new Error("Title is required");

      const slug = slugify(title);
      const id = crypto.randomUUID();

      const { error: mangaError } = await supabase.from("manga").insert({
        id,
        manga_id: mangaId || null,
        title: title.trim(),
        feature_image_url: featureImage.trim() || null,
        created_at: new Date().toISOString(),
      });
      if (mangaError) throw mangaError;

      const { error: slugError } = await supabase.from("slug_map").insert({
        slug,
        manga_id: id,
      });
      if (slugError) throw slugError;

      const pageUrls = pagesText
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean);

      const pagesData = pageUrls.map((url, index) => ({
        manga_id: id,
        page_number: index + 1,
        image_url: url,
      }));

      if (pagesData.length > 0) {
        const { error: pagesError } = await supabase
          .from("pages")
          .insert(pagesData);
        if (pagesError) throw pagesError;
      }

      const entitiesToLink = [
        {
          table: "artists",
          joinTable: "manga_artists",
          names: parseList(artists),
        },
        { table: "tags", joinTable: "manga_tags", names: parseList(tags) },
        {
          table: "parodies",
          joinTable: "manga_parodies",
          names: parseList(parodies),
        },
        {
          table: "languages",
          joinTable: "manga_languages",
          names: parseList(languages),
        },
        {
          table: "categories",
          joinTable: "manga_categories",
          names: parseList(categories),
        },
        {
          table: "groups",
          joinTable: "manga_groups",
          names: parseList(groups),
        },
        {
          table: "characters",
          joinTable: "manga_characters",
          names: parseList(characters),
        },
      ];

      for (const { table, joinTable, names } of entitiesToLink) {
        for (const name of names) {
          const entityId = await upsertEntity(table, name);
          await linkMangaJoin(joinTable, id, entityId);
        }
      }

      setMessage("Manga uploaded successfully!");

      setMangaId("");
      setTitle("");
      setFeatureImage("");
      setArtists("");
      setTags("");
      setParodies("");
      setLanguages("");
      setCategories("");
      setGroups("");
      setCharacters(""); // Clear new field
      setPagesText("");
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage("Error: " + errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Manga</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span>Manga ID (old post number)</span>
          <input
            type="text"
            value={mangaId}
            onChange={(e) => setMangaId(e.target.value)}
            placeholder="Optional: old post number (e.g. 574759)"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Title</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Feature Image URL</span>
          <input
            type="url"
            value={featureImage}
            onChange={(e) => setFeatureImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Artists</span>
          <input
            type="text"
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
            placeholder="Artist 1, Artist 2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Parodies</span>
          <input
            type="text"
            value={parodies}
            onChange={(e) => setParodies(e.target.value)}
            placeholder="parody1, parody2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Languages</span>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="English, Japanese"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Categories</span>
          <input
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="category1, category2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Groups</span>
          <input
            type="text"
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            placeholder="group1, group2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Characters</span>
          <input
            type="text"
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            placeholder="character1, character2"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Pages (one image URL per line)</span>
          <textarea
            rows={6}
            value={pagesText}
            onChange={(e) => setPagesText(e.target.value)}
            placeholder="https://example.com/page1.jpg\nhttps://example.com/page2.jpg"
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 font-semibold ${
            message.startsWith("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
