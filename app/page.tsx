import { RecommendedComics } from "@/components/recommended-comics";
import { LatestComics } from "@/components/latest-comics";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Recommended For You</h2>
        <RecommendedComics />
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6">Latest Comics</h2>
        <LatestComics />
      </section>
    </main>
  );
}
