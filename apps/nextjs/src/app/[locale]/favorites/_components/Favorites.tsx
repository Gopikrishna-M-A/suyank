"use client";

import { use } from "react";

import type { RouterOutputs } from "@acme/api";

import MemeCard from "~/components/MemeCard";
import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export default function Favorites(props: {
  favorites: Promise<RouterOutputs["meme"]["allFavorites"]>;
}) {
  const t = useI18n();

  // TODO: Make `useSuspenseQuery` work without having to pass a promise from RSC
  const initialData = use(props.favorites);

  const { data: memes } = api.meme.allFavorites.useQuery(undefined, {
    initialData,
  });

  return memes?.length > 0 ? (
    <div className="grid grid-cols-4 gap-6">
      {memes.map((m, i) => {
        return <MemeCard key={i} meme={m} />;
      })}
    </div>
  ) : (
    <div className="text-xl">No favorites!</div>
  );
}
