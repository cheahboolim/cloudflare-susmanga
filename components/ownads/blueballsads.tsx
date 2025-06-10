"use client";

import Image from "next/image";

export default function GifAd() {
  return (
    <div className="flex justify-center my-4">
      <a
        href="https://blueballs.lol/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="https://cdn.susmanga.com/blueballs%20ads%20on%20susmanga.gif"
          alt="SusManga Ad"
          width={300}
          height={300}
          unoptimized // Important for GIFs hosted externally
        />
      </a>
    </div>
  );
}
