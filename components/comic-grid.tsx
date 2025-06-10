import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";

export interface Comic {
  id: string;
  title: string;
  slug: string;
  featureImage: string;
  author: {
    name: string;
  };
}

interface ComicGridProps {
  comics: Comic[];
}

export function ComicGrid({ comics }: ComicGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {comics.map((comic: Comic) => (
        <Card key={comic.id} className="overflow-hidden group">
          <Link href={`/comic/${comic.slug}`}>
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={comic.featureImage || "/placeholder.svg"}
                alt={comic.title}
                fill
                unoptimized
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
          <CardContent className="p-4">
            <Link href={`/comic/${comic.slug}`} className="hover:underline">
              <h3 className="font-bold line-clamp-1">{comic.title}</h3>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
