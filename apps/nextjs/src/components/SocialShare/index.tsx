"use client";

import { ReactNode } from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

import { useI18n } from "~/locales/client";

interface Props {
  element: ReactNode;
  memeId: string;
}

export default function SocialShare({ element, memeId }: Props) {
  const t = useI18n();

  const shareUrl = `https://yourmeme.net?memeId=${memeId}`;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog>
        <DialogTrigger asChild>{element}</DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("share")}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 py-4">
            <FacebookShareButton url={shareUrl}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl}>
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
