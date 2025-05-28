"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMobile();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const navItems = [
    { title: "Upload", href: "/upload", special: true },
    { title: "Tags", href: "/tags" },
    { title: "Random", href: "/random" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between px-2">
        {isMobile ? (
          // ✅ MOBILE LAYOUT
          <div className="flex w-full items-center justify-between gap-2">
            {/* Left - Logo */}
            <Link
              href="/"
              className="w-[10%] min-w-[40px] flex justify-start font-bold text-xl"
            >
              SM
            </Link>

            {/* Center - Full Width Search Bar */}
            <form
              onSubmit={handleSearch}
              className="w-[80%] flex justify-center"
            >
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SusManga.com"
                className="w-full rounded-full text-sm placeholder:text-gray-500/70"
              />
            </form>

            {/* Right - Mobile Menu */}
            <div className="w-[10%] flex justify-end">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <nav className="grid gap-4 mt-4 text-lg font-medium">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "transition-colors hover:text-foreground/80",
                          pathname === item.href
                            ? "text-foreground"
                            : "text-foreground/60"
                        )}
                      >
                        {item.special ? (
                          <Button
                            className="w-full bg-[#FF1493] hover:bg-[#e01382] text-white"
                            size="sm"
                          >
                            {item.title}
                          </Button>
                        ) : (
                          item.title
                        )}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        ) : (
          // ✅ DESKTOP LAYOUT
          <div className="flex w-full items-center justify-between">
            {/* Left - Logo */}
            <Link href="/" className="font-bold text-xl">
              SusManga
            </Link>

            {/* Center - Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-4 flex-1 max-w-lg flex justify-center"
            >
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SusManga.com"
                className="w-full rounded-full text-sm placeholder:text-gray-500/70"
              />
            </form>

            {/* Right - Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link href="/upload">
                <Button
                  className="bg-[#FF1493] hover:bg-[#e01382] text-white"
                  size="sm"
                >
                  Upload
                </Button>
              </Link>
              <Link href="/for-you">
                <Button variant="ghost" size="sm">
                  For You
                </Button>
              </Link>
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
