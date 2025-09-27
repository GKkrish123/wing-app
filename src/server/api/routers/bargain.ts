import { z } from "zod";
import { authroizedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BargainStatus, RequestStatus } from "@prisma/client";

export const bargainRouter = createTRPCRouter({
  // Get current bargain for a conversation
  getCurrentBargain: authroizedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          OR: [
            { seekerId: userId },
            { helperId: userId },
          ],
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      // Get the latest active bargain
      const bargain = await ctx.db.bargain.findFirst({
        where: {
          conversationId: input.conversationId,
          status: {
            not: BargainStatus.CANCELLED
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          offers: {
            orderBy: { createdAt: 'asc' },
            include: { offerer: { select: { id: true, name: true } } }
          },
          initiator: { select: { id: true, name: true } },
          conversation: {
            include: {
              seeker: { select: { id: true, name: true } },
              helper: { select: { id: true, name: true } }
            }
          }
        }
      });

      return bargain;
    }),

  // Create a new bargain or counter-offer
  createOffer: authroizedProcedure
    .input(z.object({ 
      conversationId: z.string(), 
      amount: z.number().positive() 
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          OR: [
            { seekerId: userId },
            { helperId: userId },
          ],
        },
        select: {
          requestId: true,
          request: {
            select: {
              status: true,
            }
          },
          seekerId: true,
          helperId: true,
        }
      });

      if (!conversation) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      const isSeeker = conversation.seekerId === userId;
      const isHelper = conversation.helperId === userId;

      // Get existing active bargain
      const existingBargain = await ctx.db.bargain.findFirst({
        where: {
          conversationId: input.conversationId,
          status: {
            not: BargainStatus.CANCELLED
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      let bargain;

      if (!existingBargain) {
        // Create new bargain
        bargain = await ctx.db.bargain.create({
          data: {
            conversationId: input.conversationId,
            currentAmount: input.amount,
            initiatedBy: userId,
            status: isHelper ? BargainStatus.PENDING_SEEKER_RESPONSE : BargainStatus.PENDING_HELPER_RESPONSE,
            helperApproved: isHelper,
            seekerApproved: isSeeker,
          }
        });
      } else {
        // Update existing bargain with new offer
        bargain = await ctx.db.bargain.update({
          where: { id: existingBargain.id },
          data: {
            currentAmount: input.amount,
            initiatedBy: userId,
            status: isHelper ? BargainStatus.PENDING_SEEKER_RESPONSE : BargainStatus.PENDING_HELPER_RESPONSE,
            helperApproved: isHelper,
            seekerApproved: isSeeker,
            isConfirmed: false,
            confirmedAt: null,
          }
        });
      }

      // Create the offer record
      await ctx.db.bargainOffer.create({
        data: {
          bargainId: bargain.id,
          amount: input.amount,
          offeredBy: userId,
        }
      });

      if (conversation.request.status !== RequestStatus.BARGAINING) {
        await ctx.db.request.update({
          where: { id: conversation.requestId },
            data: {
              status: RequestStatus.BARGAINING,
            }
          });
      }
      return bargain;
    }),

  // Accept current offer
  acceptOffer: authroizedProcedure
    .input(z.object({ bargainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const bargain = await ctx.db.bargain.findUnique({
        where: { id: input.bargainId },
        include: {
          conversation: true
        }
      });

      if (!bargain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bargain not found." });
      }

      // Verify user is part of the conversation
      if (bargain.conversation.seekerId !== userId && bargain.conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      const isSeeker = bargain.conversation.seekerId === userId;
      const isHelper = bargain.conversation.helperId === userId;

      // Update approval status
      const updateData: any = {};
      
      if (isSeeker) {
        updateData.seekerApproved = true;
      } else if (isHelper) {
        updateData.helperApproved = true;
      }

      // Check if both have approved
      const currentHelperApproved = isHelper ? true : bargain.helperApproved;
      const currentSeekerApproved = isSeeker ? true : bargain.seekerApproved;

      if (currentHelperApproved && currentSeekerApproved) {
        updateData.status = BargainStatus.AGREED;
      }

      const updatedBargain = await ctx.db.bargain.update({
        where: { id: input.bargainId },
        data: updateData
      });

      return updatedBargain;
    }),

  // Final confirmation by seeker (locks the deal)
  confirmDeal: authroizedProcedure
    .input(z.object({ bargainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const bargain = await ctx.db.bargain.findUnique({
        where: { id: input.bargainId },
        include: {
          conversation: true
        }
      });

      if (!bargain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bargain not found." });
      }

      // Only seeker can confirm the deal
      if (bargain.conversation.seekerId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the seeker can confirm the deal." });
      }

      // Bargain must be in AGREED status
      if (bargain.status !== BargainStatus.AGREED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bargain must be agreed upon by both parties before confirmation." });
      }

      const confirmedBargain = await ctx.db.bargain.update({
        where: { id: input.bargainId },
        data: {
          status: BargainStatus.CONFIRMED,
          isConfirmed: true,
          confirmedAt: new Date(),
        }
      });

      return confirmedBargain;
    }),

  // Cancel bargain
  cancelBargain: authroizedProcedure
    .input(z.object({ bargainId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const bargain = await ctx.db.bargain.findUnique({
        where: { id: input.bargainId },
        include: {
          conversation: true
        }
      });

      if (!bargain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bargain not found." });
      }

      // Verify user is part of the conversation
      if (bargain.conversation.seekerId !== userId && bargain.conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      const cancelledBargain = await ctx.db.bargain.update({
        where: { id: input.bargainId },
        data: {
          status: BargainStatus.CANCELLED,
        }
      });

      return cancelledBargain;
    }),

  // Get bargain history for a conversation
  getBargainHistory: authroizedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          OR: [
            { seekerId: userId },
            { helperId: userId },
          ],
        },
      });

      if (!conversation) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this conversation." });
      }

      const bargains = await ctx.db.bargain.findMany({
        where: {
          conversationId: input.conversationId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          offers: {
            orderBy: { createdAt: 'asc' },
            include: { offerer: { select: { id: true, name: true } } }
          },
          initiator: { select: { id: true, name: true } },
        }
      });

      return bargains;
    }),
});
