"use client";

import { use, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import type { RouterOutputs } from "@acme/api";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";
import { MemeCard } from "./MemeCard";

export function Memes(props: {
  trendingMemes: Promise<RouterOutputs["meme"]["trending"]>;
}) {
  const t = useI18n();

  const initialData = use(props.trendingMemes);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(10);
  const [memes, setMemes] = useState(initialData.memes);
  const [hasMore, setHasMore] = useState(
    initialData?.total && memes.length < initialData?.total,
  );

  const { data, refetch } = api.meme.trending.useQuery(
    { limit, offset: offset },
    {
      enabled: false,
    },
  );

  const fetchMoreMemes = async () => {
    const newOffset = offset + limit;
    const response = await refetch();

    setMemes((prevMemes) =>
      response?.data?.memes
        ? [...prevMemes, ...response?.data?.memes]
        : [...prevMemes],
    );

    setOffset(newOffset);
    setHasMore(
      response?.data?.total &&
        memes.length + response?.data?.memes.length < response?.data?.total,
    );
  };

  return (
    <InfiniteScroll
      dataLength={memes.length}
      next={fetchMoreMemes}
      hasMore={hasMore || true}
      loader={<h4>{t("loading")}</h4>}
      endMessage={<p>You have seen all memes</p>}
    >
      <div className="flex flex-col items-center gap-8">
        {memes.map((m, i) => {
          return <MemeCard key={i} meme={m} />;
        })}
      </div>
    </InfiniteScroll>
  );
}
