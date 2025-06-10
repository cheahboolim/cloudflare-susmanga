"use client";

import { useState } from "react";

export default function UrlUploadPage() {
  const [remoteUrl, setRemoteUrl] = useState("");
  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
    setCdnUrl(null);

    try {
      const res = await fetch("/api/r2-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: remoteUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setCdnUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">URL → R2 Upload Test</h1>

      <input
        type="url"
        placeholder="Paste remote image URL here"
        value={remoteUrl}
        onChange={(e) => setRemoteUrl(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !remoteUrl.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading…" : "Upload URL"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {cdnUrl && (
        <div className="space-y-2">
          <p className="text-green-600 font-semibold">Upload successful!</p>
          <input
            type="text"
            readOnly
            value={cdnUrl}
            className="w-full border px-3 py-2 rounded"
          />
          <a
            href={cdnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View on CDN
          </a>
          <img src={cdnUrl} alt="Uploaded to R2" className="mt-2 max-w-full" />
        </div>
      )}
    </div>
  );
}
