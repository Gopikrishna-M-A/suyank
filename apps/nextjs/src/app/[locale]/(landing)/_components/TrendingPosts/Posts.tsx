"use client";

import { use, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  DownloadIcon,
  Share2Icon,
} from "@radix-ui/react-icons";
import InfiniteScroll from "react-infinite-scroll-component";

import type { RouterOutputs } from "@acme/api";

import SocialShare from "~/components/SocialShare";
import useImageClipboard from "~/hooks/useImageClipboard";
import useImageDownloader from "~/hooks/useImageDownloader";
import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";
import { PostCard } from "./PostCard";

export function Posts(props: {
  trendingPosts: Promise<RouterOutputs["post"]["trending"]>;
}) {
  const t = useI18n();

  const initialData = use(props.trendingPosts);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(10);
  const [posts, setPosts] = useState(initialData.posts);
  const [hasMore, setHasMore] = useState(
    initialData?.total && posts.length < initialData?.total,
  );

  const { data, refetch } = api.post.trending.useQuery(
    { limit, offset: offset },
    {
      enabled: false,
    },
  );

  const fetchMorePosts = async () => {
    const newOffset = offset + limit;
    const response = await refetch();

    setPosts((prevMemes) =>
      response?.data?.posts
        ? [...prevMemes, ...response?.data?.posts]
        : [...prevMemes],
    );

    setOffset(newOffset);
    setHasMore(
      response?.data?.total &&
        posts.length + response?.data?.posts.length < response?.data?.total,
    );
  };

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchMorePosts}
      hasMore={hasMore || true}
      loader={<h4>{t("loading")}</h4>}
      endMessage={<p>You have seen all posts</p>}
      className="w-full"
    >
      <div className="flex w-[600px] flex-col gap-8">
        {posts.map((p, i) => {
          return <PostCard key={i} post={p} />;
        })}
      </div>
    </InfiniteScroll>
  );
}
