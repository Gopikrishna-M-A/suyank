import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { getI18n } from "~/locales/server";
import { api } from "~/trpc/server";
import Favorites from "./_components/Favorites";

export const runtime = "edge";

export default async function FavoritesPage() {
  const t = await getI18n();

  const favorites = api.meme.allFavorites();

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

      <div className="flex flex-col gap-8">
        <h4 className="text-2xl">My favorites</h4>

        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-4">
              {t("loading")} {t("memes")}
            </div>
          }
        >
          <Favorites favorites={favorites} />
        </Suspense>
      </div>
    </main>
  );
}
