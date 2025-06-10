"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NewUploadPage() {
  const supabase = createClient();

  // --- Form fields ---
  const [mangaIdOld, setMangaIdOld] = useState("");
  const [title, setTitle] = useState("");
  const [featureUrl, setFeatureUrl] = useState("");
  const [pageUrlsText, setPageUrlsText] = useState("");
  const [artists, setArtists] = useState("");
  const [tags, setTags] = useState("");
  const [parodies, setParodies] = useState("");
  const [languages, setLanguages] = useState("");
  const [categories, setCategories] = useState("");
  const [groups, setGroups] = useState("");
  const [characters, setCharacters] = useState("");

  // --- UI state ---
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [logLines, setLogLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const appendLog = (line: string) =>
    setLogLines((lines) => [
      ...lines,
      `${new Date().toLocaleTimeString()}: ${line}`,
    ]);

  // call your /api/r2-upload-url
  const uploadUrlToR2 = async (url: string): Promise<string> => {
    const res = await fetch("/api/r2-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "R2 upload failed");
    return json.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // gather pages array
    const pages = pageUrlsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!title.trim() || pages.length === 0) {
      setError("Title and at least one page URL are required.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setLogLines([]);

    try {
      // 1) Upload feature image (if provided)
      let featCdn: string | null = null;
      if (featureUrl.trim()) {
        appendLog("Uploading feature image…");
        featCdn = await uploadUrlToR2(featureUrl.trim());
        appendLog(`→ Feature image uploaded: ${featCdn}`);
      }

      // 2) Upload page images one by one
      const pageCdns: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        const url = pages[i];
        appendLog(`Uploading page ${i + 1}/${pages.length}…`);
        const cdn = await uploadUrlToR2(url);
        pageCdns.push(cdn);
        appendLog(`→ Got CDN URL: ${cdn}`);
        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      // 3) Insert into Supabase
      appendLog("Inserting manga record…");
      const slug = title.trim().toLowerCase().replace(/\s+/g, "-");
      const { data: mangaData, error: mangaError } = await supabase
        .from("manga")
        .insert({
          id: crypto.randomUUID(),
          manga_id: mangaIdOld.trim() || null,
          title: title.trim(),
          feature_image_url: featCdn,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (mangaError || !mangaData?.id)
        throw mangaError || new Error("Insert manga failed");
      const newMangaId = mangaData.id;
      appendLog(`→ Manga created with ID ${newMangaId}`);

      appendLog("Creating slug_map…");
      await supabase.from("slug_map").insert({ slug, manga_id: newMangaId });

      appendLog("Inserting pages into DB…");
      await supabase.from("pages").insert(
        pageCdns.map((url, idx) => ({
          manga_id: newMangaId,
          page_number: idx + 1,
          image_url: url,
        }))
      );

      // 4) Upsert & link metadata
      const upsertLink = async (
        table: string,
        joinTable: string,
        raw: string
      ) => {
        const items = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const name of items) {
          // upsert
          const { data: exist } = await supabase
            .from(table)
            .select("id")
            .eq("name", name)
            .maybeSingle();
          const id =
            exist?.id ||
            (
              await supabase
                .from(table)
                .insert({ name, slug: name.toLowerCase().replace(/\s+/g, "-") })
                .select("id")
                .single()
            ).data!.id;
          // link
          await supabase.from(joinTable).insert({
            manga_id: newMangaId,
            [`${table.slice(0, -1)}_id`]: id,
          });
        }
      };

      appendLog("Linking metadata: artists, tags, parodies, etc…");
      await Promise.all([
        upsertLink("artists", "manga_artists", artists),
        upsertLink("tags", "manga_tags", tags),
        upsertLink("parodies", "manga_parodies", parodies),
        upsertLink("languages", "manga_languages", languages),
        upsertLink("categories", "manga_categories", categories),
        upsertLink("groups", "manga_groups", groups),
        upsertLink("characters", "manga_characters", characters),
      ]);

      appendLog("All done! 🎉");
      setProgress(100);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      appendLog(`ERROR: ${err.message}`);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">New Upload Manga</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Metadata inputs… */}
        <input
          type="text"
          placeholder="Optional old Manga ID"
          value={mangaIdOld}
          onChange={(e) => setMangaIdOld(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <label className="block">
          <span>Feature Image URL</span>
          <input
            type="url"
            placeholder="https://i1.nhentai.net/…"
            value={featureUrl}
            onChange={(e) => setFeatureUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <span>Manga Page URLs * (one per line)</span>
          <textarea
            rows={6}
            placeholder="https://i9.nhentai.net/…/1.webp"
            value={pageUrlsText}
            onChange={(e) => setPageUrlsText(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </label>

        {/* other metadata */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Artists (comma-separated)"
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Parodies"
            value={parodies}
            onChange={(e) => setParodies(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Groups"
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Characters"
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? `Uploading… ${progress}%` : "Submit"}
        </button>
      </form>

      {/* Progress bar */}
      {uploading && <progress className="w-full" value={progress} max={100} />}

      {/* Log console (dark theme) */}
      {(uploading || logLines.length > 0) && (
        <div className="bg-gray-900 text-gray-100 p-4 rounded h-48 overflow-y-auto font-mono text-sm">
          {logLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 font-semibold">{error}</p>}
      {success && (
        <p className="text-green-600 font-semibold">Upload Complete!</p>
      )}
    </main>
  );
}
