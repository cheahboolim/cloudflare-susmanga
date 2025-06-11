// app/browse/[type]/[slug]/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title skeleton */}
      <Skeleton className="w-64 h-8 mb-8" />

      {/* Grid of manga cards (loading state) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-full h-48 rounded-md" />{" "}
            {/* Feature image */}
            <Skeleton className="w-3/4 h-5" /> {/* Title */}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-10 space-x-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-10 h-10 rounded-md" />
        ))}
      </div>
    </div>
  );
}
