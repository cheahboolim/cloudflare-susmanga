// app/loading.tsx or app/(home)/loading.tsx depending on your routing

export default function Loading() {
  return (
    <main className="container mx-auto py-10">
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-muted h-40 w-full"
          />
        ))}
      </div>
    </main>
  );
}
