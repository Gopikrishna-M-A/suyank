import { Suspense } from "react";

import { getI18n } from "~/locales/server";
import { api } from "~/trpc/server";
import { Memes } from "./Memes";

export const runtime = "edge";

export default async function TrendingMemesSection() {
  const t = await getI18n();

  const trendingMemes = api.meme.trending({
    limit: 10,
    offset: 0,
  });

  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-2xl flex-col gap-4">
          {t("loading")}...
        </div>
      }
    >
      <Memes trendingMemes={trendingMemes}  />
    </Suspense>
  );
}
