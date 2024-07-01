"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/Button";

export default function CreatePostButton() {
  const router = useRouter();

  return (
    <div className="flex w-full justify-end">
      <Button onClick={() => router.push("/post/create")}>Write Post</Button>
    </div>
  );
}
