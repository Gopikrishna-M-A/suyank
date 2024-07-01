import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, eq, inArray, like, or } from "@acme/db";
import { CreateMemeSchema, Favorite, Meme, User, Vote } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const memeRouter = {
  all: publicProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.Meme.findMany({
        where: like(Meme.name, `%${input.search}%`),
        with: {
          category: true,
        },
      });
    }),

  trending: publicProcedure
    .input(
      z.object({ limit: z.number().optional(), offset: z.number().optional() }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const offset = input.offset ?? 0;

      const memes = await ctx.db.query.Meme.findMany({
        limit,
        offset,
        with: {
          category: true,
        },
      });

      const totalMemes = await ctx.db.select({ count: count() }).from(Meme); // Assuming you have a count method

      return {
        memes,
        total: totalMemes?.[0]?.count,
        limit,
        offset,
      };
    }),

  byCategoryId: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.Meme.findMany({
        where: eq(Meme.categoryId, input.categoryId),
      });
    }),

  create: publicProcedure.input(CreateMemeSchema).mutation(({ ctx, input }) => {
    return ctx.db.insert(Meme).values(input);
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.Meme.findFirst({
        where: eq(Meme.id, input.id),
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(Meme).where(and(eq(Meme.id, input.id)));
    }),

  favoriteByMemeId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const find = await ctx.db.query.Favorite.findFirst({
        where: and(
          eq(Favorite.memeId, input.id),
          eq(Favorite.userId, ctx.session.user.id),
        ),
      });

      return find || null;
    }),

  updateAddToFavorite: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const find = await ctx.db.query.Favorite.findFirst({
        where: and(
          eq(Favorite.memeId, input.id),
          eq(Favorite.userId, ctx.session.user.id),
        ),
      });

      if (find) {
        await ctx.db
          .delete(Favorite)
          .where(
            and(
              eq(Favorite.memeId, input.id),
              eq(Favorite.userId, ctx.session.user.id),
            ),
          );
      } else {
        await ctx.db.insert(Favorite).values({
          memeId: input.id,
          userId: ctx.session.user.id,
        });
      }

      return {
        status: "updated",
      };
    }),

  vote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const find = await ctx.db.query.Vote.findFirst({
        where: and(
          eq(Vote.memeId, input.id),
          eq(Vote.userId, ctx.session.user.id),
        ),
      });

      return find || null;
    }),

  upVoteCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const find = await ctx.db.query.Vote.findMany({
        where: and(eq(Vote.memeId, input.id), eq(Vote.type, "up")),
      });

      return find?.length || null;
    }),

  updateVote: protectedProcedure
    .input(z.object({ id: z.string(), type: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const find = await ctx.db.query.Vote.findFirst({
        where: and(
          eq(Vote.memeId, input.id),
          eq(Vote.userId, ctx.session.user.id),
        ),
      });

      if (find) {
        await ctx.db
          .delete(Vote)
          .where(
            and(
              eq(Vote.memeId, input.id),
              eq(Vote.userId, ctx.session.user.id),
            ),
          );
      }

      const newVote = await ctx.db.insert(Vote).values({
        type: input.type,
        memeId: input.id,
        userId: ctx.session.user.id,
      });

      return newVote;
    }),

  allFavorites: protectedProcedure.query(async ({ ctx }) => {
    const find = await ctx.db.query.Favorite.findMany({
      where: and(eq(Favorite.userId, ctx.session.user.id)),
    });

    if (!find || find?.length === 0) return [];

    const memes = await ctx.db.query.Meme.findMany({
      where: or(
        inArray(
          Meme.id,
          find.map((f) => f?.memeId),
        ),
      ),
    });

    return memes || [];
  }),
} satisfies TRPCRouterRecord;
