"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, BookmarkPlus, FolderPlus } from "lucide-react";

interface BookmarkButtonProps {
  comicId: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
}

export function BookmarkButton({
  comicId,
  variant = "outline",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [folders] = useState([
    { id: "folder1", name: "Favorites" },
    { id: "folder2", name: "Reading Later" },
    { id: "folder3", name: "Completed" },
  ]);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const addToFolder = (folderId: string) => {
    // In a real app, save bookmark to the specified folder
    console.log(`Adding comic ${comicId} to folder ${folderId}`);
    setIsBookmarked(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon">
          {isBookmarked ? (
            <Bookmark className="h-4 w-4 fill-current" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {folders.map((folder) => (
          <DropdownMenuItem
            key={folder.id}
            onClick={() => addToFolder(folder.id)}
          >
            {folder.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
