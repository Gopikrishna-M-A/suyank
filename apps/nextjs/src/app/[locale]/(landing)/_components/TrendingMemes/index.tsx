import { Suspense } from "react";

import { api } from "~/trpc/server";
import { PostCardSkeleton } from "../posts";
import { Memes } from "./Memes";

export const runtime = "edge";

export default function TrendingMemesSection() {
  const trendingMemes = api.meme.trending({
    limit: 10,
    offset: 0,
  });

  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col gap-4">
          <PostCardSkeleton />
        </div>
      }
    >
      <Memes trendingMemes={trendingMemes} />
    </Suspense>
  );
}
