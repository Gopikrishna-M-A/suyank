import { authRouter } from "./router/auth";
import { categoryRouter } from "./router/category";
import { memeRouter } from "./router/meme";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  category: categoryRouter,
  meme: memeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
