"use client";

import { use, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import type { RouterOutputs } from "@acme/api";
import { cn } from "@acme/ui";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";
import { MemeCard } from "./MemeCard";

export function Memes(props: {
  trendingMemes: Promise<RouterOutputs["meme"]["trending"]>;
}) {
  const t = useI18n();

  const initialData = use(props.trendingMemes);

  const [filter, setFilter] = useState<string[]>([]);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(10);
  const [memes, setMemes] = useState(initialData.memes);
  const [hasMore, setHasMore] = useState(
    initialData?.total && memes.length < initialData?.total,
  );

  const { data, refetch } = api.meme.trending.useQuery(
    { limit, offset: offset, tags: filter },
    {
      enabled: false,
    },
  );

  const { data: allTags } = api.tag.all.useQuery(undefined);

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

  const updateFilter = async () => {
    setMemes([]);

    const newOffset = 0;
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

  useEffect(() => {
    updateFilter();
  }, [filter]);

  return (
    <div className="max-w-2xl">
      <InfiniteScroll
        dataLength={memes.length}
        next={fetchMoreMemes}
        hasMore={hasMore || true}
        loader={<h4>{t("loading")}</h4>}
        endMessage={<p>You have seen all memes</p>}
      >
        <div className="mb-4">
          <span
            className="cursor-pointer underline"
            onClick={() => setFilter([])}
          >
            {t("clear_all")}
          </span>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {allTags?.map((tag) => (
            <span
              className={cn(
                "cursor-pointer rounded-lg bg-slate-400 px-2 py-1 font-['pretendard-bold']",
                filter?.includes(tag?.id) ? "bg-slate-400" : "bg-slate-100",
              )}
              onClick={() => {
                if (filter.includes(tag?.id)) {
                  setFilter(filter.filter((res) => res !== tag?.id));
                } else {
                  setFilter([tag.id]);
                }
              }}
            >
              {tag?.title}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8">
          {memes.map((m, i) => {
            return <MemeCard key={i} meme={m as any} />;
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}
