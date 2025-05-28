import Image from "next/image";
import Link from "next/link";

interface ComicPreviewProps {
  images: string[];
  comicSlug: string;
}

export function ComicPreview({ images, comicSlug }: ComicPreviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <Link
          key={index}
          href={`/comic/${comicSlug}/read?page=${index}`}
          className="relative aspect-[3/4] overflow-hidden rounded-lg group"
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={`Preview ${index + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Read from here
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
