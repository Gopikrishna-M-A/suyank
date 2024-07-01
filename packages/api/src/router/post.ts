import type { TRPCRouterRecord } from "@trpc/server";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { count, desc, eq } from "@acme/db";
import { Post } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.Post.findMany({
      orderBy: desc(Post.id),
      limit: 10,
    });
  }),

  trending: publicProcedure
    .input(
      z.object({ limit: z.number().optional(), offset: z.number().optional() }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const offset = input.offset ?? 0;

      const posts = await ctx.db.query.Post.findMany({
        limit,
        offset,
      });

      const totalPosts = await ctx.db.select({ count: count() }).from(Post); // Assuming you have a count method

      return {
        posts,
        total: totalPosts?.[0]?.count,
        limit,
        offset,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.Post.findFirst({
        where: eq(Post.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(
      createInsertSchema(Post, {
        title: z.string().max(256),
        content: z.string().max(256),
      }).omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      }),
    )
    .mutation(({ ctx, input }) => {
      console.log("## id-", ctx.session?.user?.id);
      return ctx.db
        .insert(Post)
        .values({ ...input, userId: ctx.session?.user?.id });
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Post).where(eq(Post.id, input));
  }),
} satisfies TRPCRouterRecord;
