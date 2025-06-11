import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSearchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">
        <Skeleton className="w-64 h-8" />
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-64 rounded-md" />
        ))}
      </div>
    </div>
  );
}
