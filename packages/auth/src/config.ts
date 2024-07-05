import type { DefaultSession, NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";

import { db } from "@acme/db/client";
import { Account, Session, User } from "@acme/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: User,
    accountsTable: Account,
    sessionsTable: Session,
  }),
  providers: [Google],
  callbacks: {
    
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable with session strategy";

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
} satisfies NextAuthConfig;
