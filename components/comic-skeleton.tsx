// components/comic-skeleton.tsx
export function ComicCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-gray-100 dark:bg-gray-800 p-2">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-md mb-3" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}
