import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { count, desc, eq, like, sql } from "@acme/db";
import { Category, Meme } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const categoryRouter = {
  all: publicProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.Category.findMany({
        where: like(Category.name, `%${input.search}%`),
      });
    }),

  allWithMemeCount: publicProcedure.query(async ({ ctx }) => {
    const memes = await ctx.db.query.Meme.findMany({
      orderBy: desc(Meme.id),
      with: {
        category: true,
      },
    });

    const result = memes.reduce((acc: any[], meme: any) => {
      const { category } = meme;
      const existingCategory = acc.find((cat) => cat.id === category.id);

      if (existingCategory) {
        existingCategory.memeCount += 1;
      } else {
        acc.push({
          ...category,
          memeCount: 1,
        });
      }

      return acc;
    }, []);

    return result as (typeof Category & { memeCount: true })[];
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.Category.findFirst({
        where: eq(Category.id, input.id),
      });
    }),

  setThumbnail: protectedProcedure
    .input(z.object({ categoryId: z.string(), imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(Category)
        .set({
          image: input.imageUrl,
          updatedAt: sql`now()`,
        })
        .where(eq(Category.id, input.categoryId))
        .execute();

      console.log("### result-", result);

      return result;
    }),
} satisfies TRPCRouterRecord;
