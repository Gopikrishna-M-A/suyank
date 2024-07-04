import { Suspense } from "react";

import { api } from "~/trpc/server";
import { CreatePostForm, PostCardSkeleton } from "../posts";
import CreatePostButton from "./CreatePostButton";
import { Posts } from "./Posts";

export const runtime = "edge";

export default function TrendingPostsSection() {
  const trendingPosts = api.post.trending({
    limit: 10,
    offset: 0,
  });

  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-2xl flex-col gap-4">Loading...</div>
      }
    >
      <div className="flex w-full flex-col items-center gap-[20px]">
        <CreatePostButton />

        <Posts trendingPosts={trendingPosts} />
      </div>
    </Suspense>
  );
}
