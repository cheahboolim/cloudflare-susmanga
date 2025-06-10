"use client";

import React, { useState } from "react";

export default function TestFull() {
  const [postId, setPostId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!postId) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/testfull?id=${postId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPostId("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Test NHentai Full Scrape</h1>

      {!result && (
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="Enter post ID"
            className="border px-4 py-2 rounded w-48"
          />
          <button
            onClick={handleScrape}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Scrape
          </button>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {result && (
        <div className="space-y-4">
          <p>
            <strong>Title:</strong> {result.title}
          </p>
          <p>
            <strong>Feature Image:</strong>{" "}
            <a
              href={result.featureImage}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
          </p>
          <p>
            <strong>Total Pages:</strong> {result.totalPages}
          </p>
          <p>
            <strong>Tags:</strong> {result.tags.join(", ") || "None"}
          </p>
          <p>
            <strong>Parodies:</strong> {result.parodies.join(", ") || "None"}
          </p>
          <p>
            <strong>Characters:</strong>{" "}
            {result.characters.join(", ") || "None"}
          </p>
          <p>
            <strong>Artists:</strong> {result.artists.join(", ") || "None"}
          </p>
          <p>
            <strong>Languages:</strong> {result.languages.join(", ") || "None"}
          </p>
          <p>
            <strong>Categories:</strong>{" "}
            {result.categories.join(", ") || "None"}
          </p>
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
