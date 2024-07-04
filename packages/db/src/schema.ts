//schema.ts

import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Tag = pgTable("tag", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export const Favorite = pgTable("favorite", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  memeId: uuid("memeId")
    .notNull()
    .references(() => Meme.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
});

export const FavoriteRelationsToMeme = relations(Favorite, ({ one }) => ({
  meme: one(Meme, {
    fields: [Favorite.memeId],
    references: [Meme.id],
  }),
}));

export const FavoriteRelationsToUser = relations(Favorite, ({ one }) => ({
  user: one(User, {
    fields: [Favorite.userId],
    references: [User.id],
  }),
}));

export const Category = pgTable("category", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export const Meme = pgTable("meme", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  categoryId: uuid("categoryId")
    .notNull()
    .references(() => Category.id, { onDelete: "cascade" }),
});

export const MemeRelations = relations(Meme, ({ one }) => ({
  category: one(Category, {
    fields: [Meme.categoryId],
    references: [Category.id],
  }),
}));

export const CreateMemeSchema = createInsertSchema(Meme, {
  name: z.string().max(256),
  image: z.string().max(256),
  categoryId: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const Post = pgTable("post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("name", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
});

export const PostRelationsToUser = relations(Post, ({ one }) => ({
  user: one(User, {
    fields: [Post.userId],
    references: [User.id],
  }),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().min(1).max(256),
  content: z.string().min(1).max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
});

export const UserRelations = relations(User, ({ many }) => ({
  accountsaccounts: many(Account),
}));

export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },

  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

// Vote table for memes
export const VoteForMeme = pgTable("vote_meme", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  type: varchar("type", { length: 256 }).notNull(),
  memeId: uuid("memeId")
    .notNull()
    .references(() => Meme.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
});

export const VoteRelationsToMeme = relations(VoteForMeme, ({ one }) => ({
  meme: one(Meme, {
    fields: [VoteForMeme.memeId],
    references: [Meme.id],
  }),
  user: one(User, {
    fields: [VoteForMeme.userId],
    references: [User.id],
  }),
}));

// Vote table for posts
export const VoteForPost = pgTable("vote_post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  type: varchar("type", { length: 256 }).notNull(),
  postId: uuid("postId")
    .notNull()
    .references(() => Post.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
});

export const VoteRelationsToPost = relations(VoteForPost, ({ one }) => ({
  post: one(Post, {
    fields: [VoteForPost.postId],
    references: [Post.id],
  }),
  user: one(User, {
    fields: [VoteForPost.userId],
    references: [User.id],
  }),
}));



// Tag table for meme
export const TagForMeme = pgTable("tag_meme", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  memeId: uuid("memeId")
    .notNull()
    .references(() => Meme.id, { onDelete: "cascade" }),
  tagId: uuid("tagId")
    .notNull()
    .references(() => Tag.id, { onDelete: "cascade" }),
});

export const TagRelationsToMeme = relations(TagForMeme, ({ one }) => ({
  meme: one(Meme, {
    fields: [TagForMeme.memeId],
    references: [Meme.id],
  }),
  tag: one(Tag, {
    fields: [TagForMeme.tagId],
    references: [Tag.id],
  }),
}));