// app/comic/[slug]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ComicPageLoading() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-1/2 mb-4" /> {/* Title */}
      <Skeleton className="h-5 w-32 mb-2" /> {/* Author / tags */}
      <Skeleton className="h-5 w-24 mb-4" />
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full mb-6 rounded-lg" /> {/* Cover image */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
