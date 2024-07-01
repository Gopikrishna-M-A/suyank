"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CopyIcon, DownloadIcon, Share2Icon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";

import SocialShare from "~/components/SocialShare";
import useImageClipboard from "~/hooks/useImageClipboard";
import useImageDownloader from "~/hooks/useImageDownloader";
import AdminMenu from "./AdminMenu";

export default function MemeCard(props: { meme: any }) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const { downloadImage, loading: downloadingImage } = useImageDownloader();
  const { copyImageToClipboard, loading: copyingImage } = useImageClipboard();

  return (
    <div
      className="relative flex aspect-square cursor-pointer overflow-hidden rounded-md"
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

      <div className="absolute top-0 z-10 flex h-full w-full flex-col justify-end p-2 hover:backdrop-brightness-50">
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
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

          {session?.data?.user?.id &&
            [
              "04ea752a-9d41-4b3f-a2f6-b617db7b81a5",
              "cfd31414-61fb-45ea-9fb4-8e380c70b148",
            ].includes(session?.data?.user?.id) && (
              <AdminMenu meme={props.meme} />
            )}
        </div>
      </div>
    </div>
  );
}
