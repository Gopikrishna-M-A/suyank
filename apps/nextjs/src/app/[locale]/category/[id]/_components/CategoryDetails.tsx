"use client";

import { use } from "react";
import Image from "next/image";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";

export default function CategoryDetails(props: {
  id: string;
  category: Promise<RouterOutputs["category"]["byId"]>;
}) {
  // TODO: Make `useSuspenseQuery` work without having to pass a promise from RSC
  const initialData = use(props.category);

  const { data: category } = api.category.byId.useQuery(
    { id: props?.id },
    {
      initialData,
    },
  );

  return (
    <div className="flex items-center gap-6">
      {category?.image && (
        <Image
          src={category?.image}
          alt=""
          width={200}
          height={200}
          className="aspect-square rounded-full border-[12px] border-solid"
        />
      )}

      <div>
        <h1 className="text-3xl font-semibold">{category?.name}</h1>
      </div>
    </div>
  );
}
