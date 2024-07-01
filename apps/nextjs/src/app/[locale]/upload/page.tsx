import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { getI18n } from "~/locales/server";
import { MemeUploader } from "./_components/MemeUploader";

export const runtime = "edge";

export default async function UploadMeme() {
  const t = await getI18n();

  return (
    <main className="container py-4">
      <div className="mb-4 flex">
        <Link href="/">
          <div className="flex items-center gap-2">
            <ArrowLeftIcon />

            <p className="text-sm">{t("back")}</p>
          </div>
        </Link>
      </div>

      <div className="mb-4">
        <p className="text-2xl">{t("upload_meme")}</p>
      </div>

      <MemeUploader />
    </main>
  );
}
