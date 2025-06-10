"use client";

import { useState } from "react";

export default function R2UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/r2-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload error. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Upload to R2</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {imageUrl && (
        <div>
          <p className="text-green-600">Upload successful!</p>
          <input
            type="text"
            readOnly
            value={imageUrl}
            className="w-full border p-2 mt-2"
          />
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-1 block"
          >
            Open uploaded image
          </a>
          <img src={imageUrl} alt="Uploaded" className="mt-2 max-w-xs" />
        </div>
      )}
    </div>
  );
}
