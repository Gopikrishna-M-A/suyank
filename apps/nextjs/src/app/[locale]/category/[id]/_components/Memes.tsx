"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";

import type { RouterOutputs } from "@acme/api";

import MemeCard from "~/components/MemeCard";
import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export default function Memes(props: {
  categoryId: string;
  memes: Promise<RouterOutputs["meme"]["byCategoryId"]>;
}) {
  const t = useI18n();

  // TODO: Make `useSuspenseQuery` work without having to pass a promise from RSC
  const initialData = use(props.memes);

  const { data: memes } = api.meme.byCategoryId.useQuery(
    { categoryId: props?.categoryId },
    {
      initialData,
    },
  );

  return (
    <div className="grid grid-cols-4 gap-6">
      <Link href={`/upload?category=${props.categoryId}`}>
        <div className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-primary">
          <div className="text-xl">{t("upload_meme")}</div>
        </div>
      </Link>

      {memes.map((m, i) => {
        return <MemeCard key={i} meme={m} />;
      })}
    </div>
  );
}
