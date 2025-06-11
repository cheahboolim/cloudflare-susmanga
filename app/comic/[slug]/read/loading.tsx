// app/comic/[slug]/read/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function MangaReadLoading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-4">
        {/* Simulated Manga Page Skeletons */}
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-full h-[500px] rounded-lg" />
        ))}
      </div>

      {/* Navigation buttons placeholder */}
      <div className="flex justify-between items-center pt-6">
        <Skeleton className="w-24 h-10 rounded" />
        <Skeleton className="w-24 h-10 rounded" />
      </div>
    </div>
  );
}
