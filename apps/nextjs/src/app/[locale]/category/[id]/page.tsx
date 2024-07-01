import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { getI18n } from "~/locales/server";
import { api } from "~/trpc/server";
import CategoryDetails from "./_components/CategoryDetails";
import Memes from "./_components/Memes";

export const runtime = "edge";

export default async function CategoryPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const t = await getI18n();

  const category = api.category.byId({ id });
  const memes = api.meme.byCategoryId({ categoryId: id });

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
        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-4">
              {t("loading")} {t("categories")}
            </div>
          }
        >
          <CategoryDetails category={category} id={id} />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-4">
              {t("loading")} {t("memes")}
            </div>
          }
        >
          <Memes memes={memes} categoryId={id} />
        </Suspense>
      </div>
    </main>
  );
}
