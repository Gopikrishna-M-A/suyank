import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import AddTag from "./AddTag";

export default function AdminMenu({ meme }: { meme: any }) {
  const deleteMeme = api.meme.delete.useMutation();
  const setThumbnail = api.category.setThumbnail.useMutation();
  const utils = api.useUtils();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" onClick={(e) => e.stopPropagation()}>
          Admin Options
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={deleteMeme?.isPending}
            onClick={(e) => {
              e.stopPropagation();

              deleteMeme.mutate(
                {
                  id: meme?.id,
                },
                {
                  onSuccess: async () => {
                    toast.success("Meme deleted successfully");

                    await utils.meme.invalidate();
                  },
                },
              );
            }}
          >
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={setThumbnail?.isPending}
            onClick={(e) => {
              e.stopPropagation();

              setThumbnail.mutate(
                {
                  categoryId: meme?.categoryId,
                  imageUrl: meme?.image,
                },
                {
                  onSuccess: async () => {
                    toast.success("Thumbnail updated successfully");

                    await utils.category.invalidate();
                  },
                },
              );
            }}
          >
            Set as thumbnail
          </DropdownMenuItem>

          <AddTag memeId={meme?.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
