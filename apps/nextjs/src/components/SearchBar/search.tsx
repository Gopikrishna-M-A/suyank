"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

import { cn } from "@acme/ui";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@acme/ui/command";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

interface SearchProps {
  selectedResult?: any;
  onSelectResult: (product: any) => void;
}

export function Search({ selectedResult, onSelectResult }: SearchProps) {
  const t = useI18n();

  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelectResult = (product: any) => {
    onSelectResult(product);

    router.push(`/category/${product?.id}`);
  };

  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 font-['pretendard-bold'] shadow-md"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder={`${t("search_placeholder")}...`}
      />

      <CommandList>
        <SearchCategoryResults
          query={searchQuery}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
        />

        <div className="border" />

        <SearchMemeResults
          query={searchQuery}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
        />
      </CommandList>
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps["selectedResult"];
  onSelectResult: SearchProps["onSelectResult"];
}

function SearchCategoryResults({
  query,
  selectedResult,
  onSelectResult,
}: SearchResultsProps) {
  const t = useI18n();
  const [debouncedSearchQuery] = useDebounce(query, 500);

  const enabled = !!debouncedSearchQuery;

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError,
  } = api.category.all.useQuery(
    { search: debouncedSearchQuery },
    {
      enabled: enabled,
    },
  );
  const isLoading = enabled && isLoadingCategories;

  if (!enabled) return null;

  return (
    <>
      <div className={cn("p-2 text-xs text-muted-foreground")}>
        {t("categories")}
      </div>

      {/* TODO: these should have proper loading aria */}
      {isLoading && <div className="p-4 text-sm">{t("loading")}...</div>}
      {!isError && !isLoading && !categories?.length && (
        <div className="p-4 text-sm">{t("no_result_found")}</div>
      )}
      {isError && (
        <div className="p-4 text-sm">{t("something_went_wrong")}</div>
      )}

      {categories?.map(({ id, name }) => {
        return (
          <CommandItem
            key={"categories" + id}
            onSelect={() => onSelectResult({ id, name })}
            value={id}
            className="cursor-pointer"
          >
            {name}
          </CommandItem>
        );
      })}
    </>
  );
}

function SearchMemeResults({
  query,
  selectedResult,
  onSelectResult,
}: SearchResultsProps) {
  const t = useI18n();
  const [debouncedSearchQuery] = useDebounce(query, 500);

  const enabled = !!debouncedSearchQuery;

  const {
    data: memes,
    isLoading: isLoadingMemes,
    isError,
  } = api.meme.all.useQuery(
    { search: debouncedSearchQuery },
    {
      enabled: enabled,
    },
  );

  const isLoading = enabled && isLoadingMemes;

  if (!enabled) return null;

  return (
    <>
      <div className={cn("p-2 text-xs text-muted-foreground")}>
        {t("memes")}
      </div>

      {/* TODO: these should have proper loading aria */}
      {isLoading && <div className="p-4 text-sm">{t("loading")}...</div>}
      {!isError && !isLoading && !memes?.length && (
        <div className="p-4 text-sm">{t("no_result_found")}</div>
      )}
      {isError && (
        <div className="p-4 text-sm">{t("something_went_wrong")}</div>
      )}

      {memes?.map(({ id, name, categoryId }) => {
        return (
          <CommandItem
            key={"memes" + id}
            onSelect={() => onSelectResult({ id: categoryId, name })}
            value={id}
            className="cursor-pointer"
          >
            {name}
          </CommandItem>
        );
      })}
    </>
  );
}
