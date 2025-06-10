import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} SusManga. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/" className="hover:underline">
            Posts
          </Link>
          <Link href="/" className="hover:underline">
            Upload
          </Link>
        </div>
      </div>
    </footer>
  );
}
