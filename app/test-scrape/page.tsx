// app/test-scrape/page.tsx

import React from "react";
import axios from "axios";
import { load } from "cheerio";

export default async function TestScrape() {
  let result: { title?: string; error?: string } = {};
  try {
    const res = await axios.get("https://nhentai.net/g/577625/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = load(res.data);
    const title = $("h1.title, h2.title").first().text().trim();
    result.title = title || "No title found";
  } catch (err: any) {
    result.error = err.message;
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test NHentai Scrape</h1>
      {result.error ? (
        <p className="text-red-500">Error: {result.error}</p>
      ) : (
        <p className="text-green-700">Title: {result.title}</p>
      )}
    </div>
  );
}
