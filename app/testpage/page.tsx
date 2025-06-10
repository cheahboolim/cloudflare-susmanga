"use client";

import React, { useState } from "react";

export default function TestPage() {
  const [postId, setPostId] = useState("");
  const [pageId, setPageId] = useState("");
  const [result, setResult] = useState<{ imageUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!postId.trim() || !pageId.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(
        `/api/testpage?postId=${postId}&pageId=${pageId}`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult({ imageUrl: data.imageUrl });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPostId("");
    setPageId("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">📄 Test NHentai Reader Scrape</h1>

      {!result && (
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="Post ID (e.g. 577624)"
              className="border px-4 py-2 rounded flex-1"
            />
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="Page # (e.g. 1)"
              className="border px-4 py-2 rounded w-24"
            />
          </div>
          <button
            onClick={handleScrape}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Scraping…" : "Scrape"}
          </button>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading reader page…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {result && (
        <div className="space-y-4">
          <p>
            <strong>Image URL:</strong>{" "}
            <a
              href={result.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {result.imageUrl}
            </a>
          </p>
          <img
            src={result.imageUrl}
            alt={`Page ${pageId}`}
            className="border rounded max-w-full"
          />
          <button
            onClick={handleReset}
            className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            🔁 Start Again
          </button>
        </div>
      )}
    </div>
  );
}
