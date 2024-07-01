"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "@radix-ui/react-icons";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { useI18n } from "~/locales/client";
import { api } from "~/trpc/react";

export const MemeUploader: React.FC = () => {
  const t = useI18n();

  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");

  const { data: categories } = api.category.all.useQuery({
    search: "",
  });

  const utils = api.useUtils();

  const createMeme = api.meme.create.useMutation();

  const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");

  const formSchema = z.object({
    image: z
      //Rest of validations done via react dropzone
      .instanceof(File)
      .refine((file) => file.size !== 0, "Please upload an image"),
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      image: new File([""], "filename"),
      name: "",
      category: "",
    },
  });

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const reader = new FileReader();
      try {
        reader.onload = () => setPreview(reader.result);
        if (acceptedFiles[0]) {
          reader.readAsDataURL(acceptedFiles[0]);
          form.setValue("image", acceptedFiles[0]);
        }
        form.clearErrors("image");
      } catch (error) {
        setPreview(null);
        form.resetField("image");
      }
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 1000000,
      accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
    });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const fileExt = values?.image?.name?.split(".").pop();

    try {
      const response = await fetch(`/api/upload?fileExt=${fileExt}`, {
        method: "POST",
        body: values?.image,
      });

      const newBlob = await response.json();

      createMeme.mutate(
        {
          name: values?.name,
          image: newBlob?.url,
          categoryId: values?.category,
        },
        {
          onSuccess: async () => {
            form.reset();
            await utils.meme.invalidate();

            toast.success(`Meme uploaded successfully 🎉 ${values.image.name}`);

            router.push(`/category/${values?.category}`);
          },
          onError: (err) => {
            toast.error("Failed to create post");
          },
        },
      );
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    if (category) {
      form.setValue("category", category);
    }
  }, [category]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <div className="flex justify-between gap-12">
          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem className="flex-1">
                <FormControl>
                  <div
                    {...getRootProps()}
                    className="mx-auto flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-lg border border-foreground p-8 shadow-sm shadow-foreground"
                  >
                    {preview && (
                      <img
                        src={preview as string}
                        alt="Uploaded image"
                        className="max-h-[200px] rounded-lg"
                      />
                    )}
                    <ImageIcon
                      className={`size-40 ${preview ? "hidden" : "block"}`}
                    />
                    <Input {...getInputProps()} type="file" />
                    {isDragActive ? (
                      <p>{t("drop_image")}</p>
                    ) : (
                      <p>{t("upload_input_placeholder")}</p>
                    )}
                  </div>
                </FormControl>
                <FormMessage>
                  {fileRejections.length !== 0 && (
                    <p>{t("upload_image_error")}</p>
                  )}
                </FormMessage>
              </FormItem>
            )}
          />

          <div className="flex flex-1 flex-col gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name_input_label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("name_input_placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("category_input_label")}</FormLabel>
                  <FormControl>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("category_input_placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat, i) => (
                          <SelectItem value={cat?.id} key={i}>
                            {cat?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
};
