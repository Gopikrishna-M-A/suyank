import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { getI18n } from "~/locales/server";
import { api } from "~/trpc/server";
import { CategoryList } from "./_components/CategoryList";
import MenuOption from "./_components/MenuOption";
import { PostCardSkeleton } from "./_components/posts";
import TrendingMemes from "./_components/TrendingMemes";
import TrendingPosts from "./_components/TrendingPosts";

export const runtime = "edge";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const t = await getI18n();

  const categories = api.category.all({
    search: "",
  });

  return (
    <main className="container py-4">
      <Tabs defaultValue="trending_memes" className="mb-4">
        <TabsList className="mb-4 w-full">
        <TabsTrigger value="trending_memes" className="w-[200px]">
            {t("trending_memes")}
          </TabsTrigger>

          <TabsTrigger value="discover_memes" className="w-[200px]">
            {t("discover_memes")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover_memes">
          <Suspense
            fallback={
              <div className="flex w-full flex-col gap-4">
                <PostCardSkeleton />
              </div>
            }
          >
            <CategoryList categories={categories} />
          </Suspense>
        </TabsContent>

        <TabsContent value="trending_memes">
          <div className="relative flex justify-between gap-2">
            <div>
              <MenuOption />
            </div>
            {searchParams?.type === "post" ? (
              <TrendingPosts />
            ) : (
              <TrendingMemes />
            )}

            <div></div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
