"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

type Ad = {
  id: string;
  position: string;
  html: string | null;
  enabled: boolean;
  created_at: string;
};

export default function ManageAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading ads:", error.message);
    } else {
      setAds(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleChange = (
    index: number,
    field: keyof Ad,
    value: string | boolean
  ) => {
    setAds((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    for (const ad of ads) {
      const { error } = await supabase
        .from("ads")
        .update({ html: ad.html, enabled: ad.enabled })
        .eq("id", ad.id);

      if (error) {
        console.error("Error saving ad:", error.message);
      }
    }
    setSaving(false);
    alert("Ads updated successfully.");
    fetchAds();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Banner Ads</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className="mb-6 border rounded-lg p-4 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow"
            >
              <div className="mb-2">
                <label className="block mb-1 font-medium">Position</label>
                <input
                  value={ad.position}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-800 border px-3 py-2 rounded text-sm cursor-not-allowed"
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">HTML Content</label>
                <textarea
                  value={ad.html ?? ""}
                  onChange={(e) => handleChange(index, "html", e.target.value)}
                  rows={5}
                  className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
                />
              </div>

              <label className="inline-flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={ad.enabled}
                  onChange={(e) =>
                    handleChange(index, "enabled", e.target.checked)
                  }
                  className="mr-2"
                />
                Enabled
              </label>
            </div>
          ))}

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
