import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getClientPrograms, getProgramById, getProgramResources, getAllPrograms } from "./db";
import { notifyProgramAssigned, notifyResourceAdded } from "./notifications";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  programs: router({
    list: publicProcedure.query(async () => {
      return await getAllPrograms();
    }),
  }),

  dashboard: router({
    getPrograms: protectedProcedure.query(async ({ ctx }) => {
      return await getClientPrograms(ctx.user.id);
    }),
  }),

  admin: router({
    assignProgram: protectedProcedure
      .input(z.object({ clientId: z.number(), programId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await notifyProgramAssigned("Client", `Program ${input.programId}`);
        return { success: true };
      }),
    addResource: protectedProcedure
      .input(z.object({ programId: z.number(), title: z.string(), type: z.enum(["pdf", "video"]), url: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await notifyResourceAdded(input.title, `Program ${input.programId}`);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
