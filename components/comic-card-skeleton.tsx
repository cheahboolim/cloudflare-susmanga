import React from "react";

export function ComicCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-md overflow-hidden shadow">
      <div className="w-full aspect-[3/4] bg-gray-300" />
      <div className="p-2 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
}
