"use client";

import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";

import { api } from "~/trpc/react";

interface Post {
  id: string;
  title: string;
  content: string;
  upvoteCount: number;
  userVoteType: "up" | "down" | null;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [upvoteCount, setUpvoteCount] = useState<number>(post.upvoteCount);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    post.userVoteType,
  );
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const voteMutation = api.post.vote.useMutation();

  useEffect(() => {
    setUpvoteCount(post.upvoteCount);
    setUserVote(post.userVoteType);
  }, [post]);

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
        id: post.id,
        type: newVoteType,
      });
      console.log("result", result);
    }, 300);

    setDebounceTimeout(timeout);
  };

  return (
    <div className="flex flex-col gap-4 border-0 border-b-[1px] border-gray-400 pb-8">
      <div className="font-['pretendard-bold'] text-3xl">{post?.title}</div>

      <div className="text-md font-['pretendard-bold']">{post?.content}</div>
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
    </div>
  );
}
