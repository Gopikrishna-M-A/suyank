"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { RouterOutputs } from "@acme/api";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export function CategoryList(props: {
  categories: Promise<RouterOutputs["category"]["all"]>;
}) {
  const router = useRouter();
  const t = useI18n();

  const initialData = use(props.categories);
  const { data: categories } = api.category.all.useQuery(
    { search: "" },
    {
      initialData,
    },
  );

  return (
    <>
      <div className="mb-4 grid grid-cols-6 gap-6">
        <div
          className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-primary"
          onClick={() => router.push("/favorites")}
        >
          <div className="text-xl">{t("my_favorites")}</div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-6">
        <Link href={`/upload`}>
          <div className="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-primary">
            <div className="text-xl">{t("upload_meme")}</div>
          </div>
        </Link>

        {categories.map((c, i) => {
          return <CategoryCard key={i} category={c} />;
        })}
      </div>
    </>
  );
}

export function CategoryCard(props: { category: any }) {
  return (
    <Link href={`/category/${props?.category?.id}`}>
      <div className="relative z-10 aspect-square cursor-pointer overflow-hidden rounded-md">
        <Image
          src={props?.category?.image}
          alt=""
          width={0}
          height={0}
          sizes="100vw"
          className="absolute z-0 h-auto w-full"
          onError={(e) => console.log("category image err:", e)}
        />

        <div className="from-66% relative z-10 flex h-full flex-col justify-end bg-gradient-to-b from-transparent via-[#18181B00] to-[#26272B] p-2">
          <div className="text-lg font-['pretendard-bold'] text-white">
            {props?.category?.name}
          </div>
        </div>
      </div>
    </Link>
  );
}
