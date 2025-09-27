import { userRouter } from "@/server/api/routers/user";
import { requestRouter } from "@/server/api/routers/request";
import { chatRouter } from "@/server/api/routers/chat";
import { bargainRouter } from "@/server/api/routers/bargain";
import { paymentRouter } from "@/server/api/routers/payment";
import { locationSharingRouter } from "@/server/api/routers/location-sharing";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  request: requestRouter,
  chat: chatRouter,
  bargain: bargainRouter,
  payment: paymentRouter,
  locationSharing: locationSharingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);