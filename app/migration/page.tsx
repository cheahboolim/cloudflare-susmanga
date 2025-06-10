"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function MigrationPage() {
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [blacklist, setBlacklist] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);

  const log = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runAction = async (method: "POST" | "DELETE") => {
    const start = parseInt(startId, 10);
    const end = parseInt(endId, 10);
    if (isNaN(start) || isNaN(end) || start < end) {
      log("Invalid ID range.");
      return;
    }

    setLogs([]);
    setProgress(0);
    setIsMigrating(true);

    const blacklistTags = blacklist
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const total = start - end + 1;
    let done = 0;

    for (let id = start; id >= end; id--) {
      log(`${method === "POST" ? "Migrating" : "Deleting"} post ${id}...`);
      try {
        const res = await fetch("/api/migrate", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            method === "POST" ? { id, blacklistTags } : { id }
          ),
        });
        const data = await res.json();
        if (data.success) {
          log(
            method === "POST"
              ? `✅ Post ${id} migrated.`
              : `🗑️ Post ${id} deleted.`
          );
        } else {
          log(`⚠️ Post ${id} skipped: ${data.message || "Unknown reason."}`);
        }
      } catch (e: any) {
        log(`❌ Error on ${id}: ${e.message}`);
      }
      done++;
      setProgress(Math.round((done / total) * 100));
      await new Promise((r) => setTimeout(r, 800));
    }

    setIsMigrating(false);
    log(method === "POST" ? "🎉 Migration complete." : "🧹 Deletion complete.");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        📥 Manga Migration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Start ID</label>
          <Input
            type="number"
            value={startId}
            onChange={(e) => setStartId(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">End ID</label>
          <Input
            type="number"
            value={endId}
            onChange={(e) => setEndId(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1">Blacklist Tags (comma separated)</label>
        <Textarea
          value={blacklist}
          onChange={(e) => setBlacklist(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={() => runAction("POST")} disabled={isMigrating}>
          {isMigrating ? "Migrating..." : "Start Migration"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => runAction("DELETE")}
          disabled={isMigrating}
        >
          {isMigrating ? "Deleting..." : "Delete Migration"}
        </Button>
      </div>

      <div>
        <label className="block mb-1">Progress</label>
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1">Logs</label>
        <div className="bg-white text-black dark:bg-black dark:text-white p-4 rounded h-64 overflow-y-auto text-sm font-mono">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
