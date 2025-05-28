import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ComicTagsProps {
  tags: string[];
}

export function ComicTags({ tags }: ComicTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag} href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
          >
            {tag}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
