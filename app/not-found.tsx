// app/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6 text-muted-foreground">
        Oops! The page you're looking for doesn’t exist.
      </p>
      <Link href="/">
        <Button
          variant="default"
          className="bg-white text-black hover:bg-gray-100"
        >
          ← Back to Home
        </Button>
      </Link>
    </main>
  );
}
