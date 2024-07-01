"use client";

import { use, useEffect, useState } from "react";
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

export function MemeCard(props: { meme: any }) {
  const pathname = usePathname();
  const router = useRouter();

  console.log("meme", props.meme);

  const { downloadImage, loading: downloadingImage } = useImageDownloader();
  const { copyImageToClipboard, loading: copyingImage } = useImageClipboard();

  // Mutation hooks
  const [upvotes, setUpvotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const { data: voteCounts, refetch: refetchVoteCounts } =
    api.meme.getVoteCounts.useQuery(
      { id: props.meme?.id ?? "" },
      {
        enabled: !!props.meme?.id,
      },
    );

  console.log("voteCounts", voteCounts?.userVote);

  useEffect(() => {
    if (voteCounts) {
      setUpvotes(voteCounts.upvotes);
      setUserVote(voteCounts.userVote);
    }
  }, [voteCounts]);

  const voteMutation = api.meme.vote.useMutation({
    onSuccess: async (data) => {
      await refetchVoteCounts();
    },
    onError: () => {
      setUpvotes((prev) => {
        if (userVote === "up") {
          return prev - 1;
        }
      });
    },
  });

  const handleUpVote = async () => {
    const voteType = "up";
    if (voteMutation.isLoading || !props.meme?.id) return;

    if (userVote == voteType) {
      setUpvotes((prev) => prev - 1);
      setUserVote(null);
    } else {
      setUpvotes((prev) => prev + 1);
      setUserVote(voteType);
    }

    try {
      await voteMutation.mutateAsync({ id: props.meme.id, voteType });
      //  setUserVote(userVote === voteType ? null : voteType);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDownVote = async () => {
    const voteType = "down";

    if (userVote == "up") {
      setUpvotes((prev) => prev - 1);
      setUserVote(voteType);
    }

    if (voteMutation.isLoading || !props.meme?.id) return;
    try {
      await voteMutation.mutateAsync({ id: props.meme.id, voteType });
      // setUserVote(userVote === voteType ? null : voteType);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div
      className="relative flex aspect-square w-full max-w-[400px] cursor-pointer overflow-hidden rounded-md"
      onClick={() => {
        router.push(`${pathname}?memeId=${props?.meme?.id}`);
      }}
    >
      <Image
        src={props?.meme?.image}
        alt=""
        width={0}
        height={0}
        sizes="100vw"
        className="m-auto w-full"
      />

      <div className="absolute top-0 z-10 flex h-full w-full flex-col justify-end hover:backdrop-brightness-50">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-center gap-2 p-2">
            <div
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleUpVote();
              }}
            >
              <ArrowUpIcon className="text-gray-700" />
              <span>{upvotes}</span>
            </div>

            <div
              className="flex cursor-pointer items-center rounded-full bg-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDownVote();
              }}
            >
              <ArrowDownIcon className="text-gray-700" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <div
              className="flex cursor-pointer items-center rounded-full bg-white p-2"
              onClick={(e) => {
                e.stopPropagation();

                if (!downloadingImage) {
                  downloadImage(props?.meme?.name, props?.meme?.image);
                }
              }}
            >
              <DownloadIcon className="text-gray-700" />
            </div>

            <div
              className="flex cursor-pointer items-center rounded-full bg-white p-2"
              onClick={(e) => {
                e.stopPropagation();

                if (!copyingImage) {
                  copyImageToClipboard(props?.meme?.image);
                }
              }}
            >
              <CopyIcon className="text-gray-700" />
            </div>

            <SocialShare
              memeId={props?.meme?.id}
              element={
                <div
                  className="flex cursor-pointer items-center rounded-full bg-white p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2Icon className="text-gray-700" />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
