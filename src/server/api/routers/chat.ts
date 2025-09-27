import { z } from "zod";
import { authroizedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  getConversation: authroizedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          OR: [
            { seekerId: userId },
            { helperId: userId },
          ],
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true },
          },
          seeker: true,
          helper: true,
          request: true,
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found." });
      }

      return conversation;
    }),

  sendMessage: authroizedProcedure
    .input(z.object({ conversationId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.supabaseUser!.id;

      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          OR: [
            { seekerId: senderId },
            { helperId: senderId },
          ],
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      const message = await ctx.db.message.create({
        data: {
          conversationId: input.conversationId,
          senderId,
          content: input.content,
        },
      });

      return message;
    }),

  getMyHelperConversations: authroizedProcedure
    .query(async ({ ctx }) => {
      const helperId = ctx.supabaseUser!.id;
      const conversations = await ctx.db.conversation.findMany({
        where: { helperId },
        orderBy: { createdAt: 'desc' },
        include: {
          seeker: true,
          request: true,
        },
      });
      return conversations;
    }),
});
