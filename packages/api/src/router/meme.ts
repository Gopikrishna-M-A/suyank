//meme.ts

import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import {
  and,
  arrayContains,
  count,
  desc,
  eq,
  inArray,
  like,
  or,
  sql,
} from "@acme/db";
import {
  Category,
  CreateMemeSchema,
  Favorite,
  Meme,
  Tag,
  TagForMeme,
  User,
  VoteForMeme,
} from "@acme/db/schema";

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
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const offset = input.offset ?? 0;
      const userId = ctx?.session?.user?.id;

      const whereCondition =
        input.tags && input.tags.length > 0
          ? inArray(Tag.id, input.tags)
          : undefined;

      const memesWithVotes = await ctx.db
        .select(
          userId
            ? {
                id: Meme.id,
                name: Meme.name,
                image: Meme.image,
                categoryId: Meme.categoryId,
                categoryName: Category.name,
                upvoteCount:
                  sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${VoteForMeme.type} = 'up' THEN ${VoteForMeme.id} END) AS INTEGER)`.as(
                    "upvote_count",
                  ),
                userVoteType: sql<
                  string | null
                >`MAX(CASE WHEN ${VoteForMeme.userId} = ${userId} THEN ${VoteForMeme.type} ELSE NULL END)`.as(
                  "user_vote_type",
                ),
              }
            : {
                id: Meme.id,
                name: Meme.name,
                image: Meme.image,
                categoryId: Meme.categoryId,
                categoryName: Category.name,
                upvoteCount:
                  sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${VoteForMeme.type} = 'up' THEN ${VoteForMeme.id} END) AS INTEGER)`.as(
                    "upvote_count",
                  ),
              },
        )
        .from(Meme)
        .leftJoin(Category, eq(Meme.categoryId, Category.id))
        .leftJoin(VoteForMeme, eq(Meme.id, VoteForMeme.memeId))
        .leftJoin(TagForMeme, eq(Meme.id, TagForMeme.memeId))
        .leftJoin(Tag, eq(TagForMeme.tagId, Tag.id))
        .where(whereCondition)
        .groupBy(Meme.id, Category.id)
        .orderBy(desc(sql`upvote_count`))
        .limit(limit)
        .offset(offset);

      const [totalCount] = await ctx.db.select({ count: count() }).from(Meme);

      const memes = memesWithVotes.map((meme) => ({
        id: meme.id,
        name: meme.name,
        image: meme.image,
        category: {
          id: meme.categoryId,
          name: meme.categoryName,
        },
        upvoteCount: meme.upvoteCount,
        userVoteType: meme.userVoteType,
      }));

      return {
        memes,
        total: totalCount?.count,
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
    .input(z.object({ id: z.string(), type: z.enum(["up", "down", "remove"]) }))
    .mutation(async ({ ctx, input }) => {
      const { id: memeId, type } = input;
      const userId = ctx.session.user.id;

      return await ctx.db.transaction(async (trx) => {
        const existingVote = await trx.query.VoteForMeme.findFirst({
          where: and(
            eq(VoteForMeme.memeId, memeId),
            eq(VoteForMeme.userId, userId),
          ),
        });

        if (existingVote) {
          if (type === "remove" || existingVote.type === type) {
            await trx
              .delete(VoteForMeme)
              .where(eq(VoteForMeme.id, existingVote.id));
          } else {
            await trx
              .update(VoteForMeme)
              .set({ type })
              .where(eq(VoteForMeme.id, existingVote.id));
          }
        } else if (type !== "remove") {
          await trx.insert(VoteForMeme).values({
            type,
            memeId,
            userId,
          });
        }

        const result = await trx.execute(sql`
          SELECT 
            COUNT(*) AS "upvoteCount"
          FROM ${VoteForMeme}
          WHERE ${VoteForMeme.memeId} = ${memeId}
          AND ${VoteForMeme.type} = 'up'
        `);

        const upvoteCount = result?.rows[0]?.upvoteCount || 0;

        return {
          upvoteCount,
          userVoteType: type === "remove" ? null : type,
        };
      });
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
