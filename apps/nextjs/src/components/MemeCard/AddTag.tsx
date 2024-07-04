"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "node_modules/@acme/ui/src/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { FancyMultiSelect } from "@acme/ui/fancy-multi-select";
import { toast } from "@acme/ui/toast";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export default function AddTag({ memeId }: { memeId: any }) {
  const t = useI18n();

  const [selected, setSelected] = useState<any>([]);

  const { data: tags } = api.tag.all.useQuery();
  const { data: selectedTags } = api.tag.byId.useQuery({
    memeId,
  });

  const updateTags = api.tag.update.useMutation();

  console.log("##3 selectedTags-", selectedTags);

  useEffect(() => {
    if (selectedTags) {
      setSelected(
        selectedTags?.map((res) => {
          let t = tags?.find((res1) => res1?.id === res?.tagId);

          console.log("## t", t, tags, selectedTags);

          return {
            label: t?.title || "",
            value: res?.id,
          };
        }),
      );
    }
  }, [selectedTags]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Tag</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 py-4">
            <FancyMultiSelect
              options={
                tags?.map((tag) => ({
                  label: tag?.title,
                  value: tag?.id,
                })) || []
              }
              selected={selected}
              setSelected={setSelected}
            />
          </div>

          <Button
            onClick={() => {
              updateTags.mutate(
                {
                  memeId,
                  tags: selected?.map((res: { value: any }) => res?.value),
                },
                {
                  onSuccess: () => toast.success("Tags updated"),
                },
              );
            }}
          >
            Update tags
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
