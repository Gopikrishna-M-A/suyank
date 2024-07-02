"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  DownloadIcon,
  Share2Icon,
} from "@radix-ui/react-icons";

import SocialShare from "~/components/SocialShare";
import useImageClipboard from "~/hooks/useImageClipboard";
import useImageDownloader from "~/hooks/useImageDownloader";
import { api } from "~/trpc/react";

interface Meme {
  id: string;
  image: string;
  name: string;
  upvoteCount: number;
  userVoteType: "up" | "down" | null;
}

interface MemeCardProps {
  meme: Meme;
}

export function MemeCard({ meme }: MemeCardProps) {
  console.log("meme", meme);

  const pathname = usePathname();
  const router = useRouter();

  const { downloadImage, loading: downloadingImage } = useImageDownloader();
  const { copyImageToClipboard, loading: copyingImage } = useImageClipboard();

  const [upvoteCount, setUpvoteCount] = useState<number>(meme.upvoteCount);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    meme.userVoteType,
  );
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const voteMutation = api.meme.vote.useMutation();

  useEffect(() => {
    setUpvoteCount(meme.upvoteCount);
    setUserVote(meme.userVoteType);
  }, [meme]);

  const handleVote = async (voteType: "up" | "down") => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    let newVoteType: "up" | "down" | "remove" = voteType;

    if (voteType === "up") {
      if (userVote === "up") {
        setUpvoteCount((prev) => prev - 1);
        setUserVote(null);
        newVoteType = "remove";
      } else {
        setUpvoteCount((prev) => prev + 1);
        setUserVote("up");
        newVoteType = "up";
      }
    } else if (voteType === "down") {
      if (userVote === "up") {
        setUpvoteCount((prev) => prev - 1);
        setUserVote("down");
        newVoteType = "down";
      } else if (userVote === "down") {
        setUserVote(null);
        newVoteType = "remove";
      } else {
        setUserVote("down");
        newVoteType = "down";
      }
    }
    const timeout = setTimeout(async () => {
      const result = await voteMutation.mutateAsync({
        id: meme.id,
        type: newVoteType,
      });
      console.log("result", result);
    }, 300);

    setDebounceTimeout(timeout);
  };

  return (
    <div
      className="relative flex aspect-square w-full max-w-[400px] cursor-pointer overflow-hidden rounded-md"
      onClick={() => {
        router.push(`${pathname}?memeId=${meme.id}`);
      }}
    >
      <Image
        src={meme.image}
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
                handleVote("up");
              }}
            >
              <ArrowUpIcon className="text-gray-700" />
              <span>{upvoteCount}</span>
            </div>

            <div
              className="flex cursor-pointer items-center rounded-full bg-white p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleVote("down");
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
                  downloadImage(meme.name, meme.image);
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
                  copyImageToClipboard(meme.image);
                }
              }}
            >
              <CopyIcon className="text-gray-700" />
            </div>

            <SocialShare
              memeId={meme.id}
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
