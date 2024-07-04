"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@acme/ui";

import { useI18n } from "~/locales/client";

export default function MenuOption({ type }: { type: string | null }) {
  const t = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed">
      <div
        className="mb-8 flex cursor-pointer items-center gap-6"
        onClick={() => {
          router.push(`${pathname}?type=meme`);
        }}
      >
        <Image
          src="/meme-tab.svg"
          alt=""
          width={50}
          height={50}
          className="text-[#909090]"
        />

        <p
          className={cn(
            "text-2xl font-semibold",
            !type || type === "meme" ? "text-black" : "text-[#909090]",
          )}
        >
          {t("meme")}
        </p>
      </div>

      <div
        className="flex cursor-pointer items-center gap-6"
        onClick={() => {
          router.push(`${pathname}?type=post`);
        }}
      >
        <Image src="/post-tab.svg" alt="" width={50} height={50} />

        <p
          className={cn(
            "text-2xl font-semibold",
            type === "post" ? "text-black" : "text-[#909090]",
          )}
        >
          {t("post")}
        </p>
      </div>
    </div>
  );
}
