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
      const meme = await ctx.db.query.Meme.findFirst({
        where: eq(Meme.id, input.id),
      });

      if (!meme) return null;

      const voteCount = await ctx.db
        .select({ count: count() })
        .from(Vote)
        .where(and(eq(Vote.memeId, input.id), eq(Vote.type, "up")));

      return {
        ...meme,
        upvotes: Number(voteCount[0]?.count) || 0,
      };
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
    .input(z.object({ id: z.string(), voteType: z.enum(["up", "down"]) }))
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.db.query.Vote.findFirst({
        where: and(
          eq(Vote.memeId, input.id),
          eq(Vote.userId, ctx.session.user.id),
        ),
      });

      if (existingVote) {
        if (existingVote.type === input.voteType) {
          // Remove vote if it's the same type
          await ctx.db.delete(Vote).where(eq(Vote.id, existingVote.id));
        } else {
          // Update vote type if it's different
          await ctx.db
            .update(Vote)
            .set({ type: input.voteType })
            .where(eq(Vote.id, existingVote.id));
        }
      } else {
        // Create new vote
        await ctx.db.insert(Vote).values({
          type: input.voteType,
          memeId: input.id,
          userId: ctx.session.user.id,
        });
      }

      // Fetch updated upvote count
      const upvoteCount = await ctx.db
        .select({ count: count() })
        .from(Vote)
        .where(and(eq(Vote.memeId, input.id), eq(Vote.type, "up")));

      // Fetch downvote count (for future use)
      const downvoteCount = await ctx.db
        .select({ count: count() })
        .from(Vote)
        .where(and(eq(Vote.memeId, input.id), eq(Vote.type, "down")));

      return {
        upvotes: Number(upvoteCount[0]?.count) || 0,
        downvotes: Number(downvoteCount[0]?.count) || 0,
      };
    }),

  getVoteCounts: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const upvoteCount = await ctx.db
        .select({ count: count() })
        .from(Vote)
        .where(and(eq(Vote.memeId, input.id), eq(Vote.type, "up")));

      const downvoteCount = await ctx.db
        .select({ count: count() })
        .from(Vote)
        .where(and(eq(Vote.memeId, input.id), eq(Vote.type, "down")));

      const userVote = await ctx.db.query.Vote.findFirst({
        where: and(
          eq(Vote.memeId, input.id),
          eq(Vote.userId, ctx.session.user.id),
        ),
        columns: { type: true },
      });

      return {
        upvotes: Number(upvoteCount[0]?.count) || 0,
        downvotes: Number(downvoteCount[0]?.count) || 0,
        userVote: userVote?.type || null,
      };
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
