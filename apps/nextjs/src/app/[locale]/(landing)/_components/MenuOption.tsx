"use client";

import { usePathname, useRouter } from "next/navigation";

export default function MenuOption() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed">
      <div
        className="mb-4 cursor-pointer text-lg font-bold"
        onClick={() => {
          router.push(`${pathname}?type=meme`);
        }}
      >
        Meme
      </div>

      <div
        className="cursor-pointer text-lg font-bold"
        onClick={() => {
          router.push(`${pathname}?type=post`);
        }}
      >
        Post
      </div>
    </div>
  );
}
