"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import SocialShare from "~/components/SocialShare";
import useImageClipboard from "~/hooks/useImageClipboard";
import useImageDownloader from "~/hooks/useImageDownloader";
import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export default function MemeDetailsModal() {
  const session = useSession();
  const t = useI18n();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { downloadImage, loading: downloadingImage } = useImageDownloader();
  const { copyImageToClipboard, loading: copyingImage } = useImageClipboard();

  const utils = api.useUtils();

  const memeId = searchParams.get("memeId");

  const { data: meme } = api.meme.byId.useQuery(
    {
      id: memeId || "",
    },
    {
      enabled: Boolean(memeId),
    },
  );

  const { data: favoriteState, refetch: refetchFavoriteState } =
    api.meme.favoriteByMemeId.useQuery(
      {
        id: memeId || "",
      },
      {
        enabled: Boolean(memeId) && session?.status === "authenticated",
      },
    );

  const addToFavorite = api.meme.updateAddToFavorite.useMutation();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return memeId ? (
    <Dialog
      open={Boolean(memeId)}
      onOpenChange={(open) => !open && router.push(pathname)}
    >
      <DialogContent className="max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>{meme?.name}</DialogTitle>
        </DialogHeader>
        <div>
          {meme ? (
            <div className="flex items-center space-x-8">
              <div className="flex-[3]">
                <Image
                  src={meme?.image}
                  alt=""
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-auto w-full"
                />
              </div>

              <div className="flex flex-[2] flex-col space-y-4">
                <Button
                  disabled={
                    session?.status !== "authenticated" ||
                    addToFavorite.isPending
                  }
                  onClick={() => {
                    if (session.status === "authenticated") {
                      addToFavorite.mutate(
                        {
                          id: meme?.id,
                        },
                        {
                          onSuccess: async () => {
                            await utils.meme.allFavorites.invalidate();
                            toast.success("Favorite updated");

                            refetchFavoriteState();
                          },
                        },
                      );
                    }
                  }}
                >
                  {favoriteState?.id
                    ? "Remove from favorite"
                    : t("add_to_favorite")}
                </Button>

                <Button
                  onClick={() => {
                    router.push(`/edit?editMemeId=${meme?.id}`);
                  }}
                >
                  {t("create_own_meme")}
                </Button>

                <Button
                  onClick={() => {
                    if (!copyingImage) {
                      copyImageToClipboard(meme?.image);
                    }
                  }}
                >
                  {t("copy_clipboard")}
                </Button>

                <Button
                  onClick={() => {
                    if (!downloadingImage) {
                      downloadImage(meme?.name, meme?.image);
                    }
                  }}
                >
                  {t("download")}
                </Button>

                <SocialShare
                  memeId={meme?.id}
                  element={<Button className="w-full">{t("share")}</Button>}
                />
              </div>
            </div>
          ) : (
            <div>{t("loading")}...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
}
