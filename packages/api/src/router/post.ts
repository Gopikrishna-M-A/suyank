import type { TRPCRouterRecord } from "@trpc/server";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { and, count, desc, eq, sql } from "@acme/db";
import { Post, VoteForPost } from "@acme/db/schema";

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
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 10;
      const offset = input.offset ?? 0;
      const userId = ctx.session?.user?.id;

      const postsWithVotes = await ctx.db
        .select({
          id: Post.id,
          title: Post.title,
          content: Post.content,
          upvoteCount:
            sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${VoteForPost.type} = 'up' THEN ${VoteForPost.id} END) AS INTEGER)`.as(
              "upvote_count",
            ),
          userVoteType: sql<
            string | null
          >`MAX(CASE WHEN ${VoteForPost.userId} = ${userId} THEN ${VoteForPost.type} ELSE NULL END)`.as(
            "user_vote_type",
          ),
        })
        .from(Post)
        .leftJoin(VoteForPost, eq(Post.id, VoteForPost.postId))
        .groupBy(Post.id)
        .orderBy(desc(sql`upvote_count`))
        .limit(limit)
        .offset(offset);

      const [totalCount] = await ctx.db.select({ count: count() }).from(Post);

      const posts = postsWithVotes.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        upvoteCount: post.upvoteCount,
        userVoteType: post.userVoteType,
      }));

      return {
        posts,
        total: totalCount?.count,
        limit,
        offset,
      };
    }),

  vote: protectedProcedure
    .input(z.object({ id: z.string(), type: z.enum(["up", "down", "remove"]) }))
    .mutation(async ({ ctx, input }) => {
      const { id: postId, type } = input;
      const userId = ctx.session.user.id;

      return await ctx.db.transaction(async (trx) => {
        const existingVote = await trx.query.VoteForPost.findFirst({
          where: and(
            eq(VoteForPost.postId, postId),
            eq(VoteForPost.userId, userId),
          ),
        });

        if (existingVote) {
          if (type === "remove" || existingVote.type === type) {
            await trx
              .delete(VoteForPost)
              .where(eq(VoteForPost.id, existingVote.id));
          } else {
            await trx
              .update(VoteForPost)
              .set({ type })
              .where(eq(VoteForPost.id, existingVote.id));
          }
        } else if (type !== "remove") {
          await trx.insert(VoteForPost).values({
            type,
            postId,
            userId,
          });
        }

        const result = await trx.execute(sql`
          SELECT 
            COUNT(*) AS "upvoteCount"
          FROM ${VoteForPost}
          WHERE ${VoteForPost.postId} = ${postId}
          AND ${VoteForPost.type} = 'up'
        `);

        const upvoteCount = result?.rows[0]?.upvoteCount || 0;

        return {
          upvoteCount,
          userVoteType: type === "remove" ? null : type,
        };
      });
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
