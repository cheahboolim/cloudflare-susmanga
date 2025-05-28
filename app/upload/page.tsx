// app/unavailable/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnavailablePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-white">
        🚧 Feature Temporarily Unavailable
      </h1>
      <p className="text-muted-foreground text-lg mb-6">
        This feature is currently under maintenance. Please check back later.
      </p>
      <Link href="/">
        <Button
          variant="secondary"
          className="text-black bg-white hover:bg-gray-100"
        >
          ← Back to Home
        </Button>
      </Link>
    </main>
  );
}
