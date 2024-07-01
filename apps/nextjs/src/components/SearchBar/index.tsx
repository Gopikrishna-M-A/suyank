"use client";

import * as React from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";

import { useI18n } from "~/locales/client";
import { Search } from "./search";

const POPOVER_WIDTH = "w-[400px]";

export default async function SearchBar() {
  const t = useI18n();

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<any | undefined>();

  const handleSetActive = React.useCallback((product: any) => {
    setSelected(product);

    // OPTIONAL: close the combobox upon selection
    setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "justify-between font-['pretendard-bold']",
            POPOVER_WIDTH,
          )}
        >
          {t("search_placeholder")}

          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" className={cn("p-0", POPOVER_WIDTH)}>
        <Search selectedResult={selected} onSelectResult={handleSetActive} />
      </PopoverContent>
    </Popover>
  );
}
