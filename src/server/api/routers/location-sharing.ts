import { z } from "zod";
import { authroizedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const locationSharingRouter = createTRPCRouter({
  // Get location sharing status for a conversation
  getLocationSharing: authroizedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;
      
      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        select: { seekerId: true, helperId: true }
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      if (conversation.seekerId !== userId && conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access this conversation" });
      }

      // Get location sharing data for both users
      const locationSharing = await ctx.db.conversationLocationSharing.findMany({
        where: { conversationId: input.conversationId },
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      });

      const currentUserSharing = locationSharing.find(ls => ls.userId === userId);
      const otherUserSharing = locationSharing.find(ls => ls.userId !== userId);

      return {
        currentUser: currentUserSharing ? {
          isSharing: currentUserSharing.isSharing,
          latitude: currentUserSharing.latitude,
          longitude: currentUserSharing.longitude,
          accuracy: currentUserSharing.accuracy,
          sharedAt: currentUserSharing.sharedAt,
          updatedAt: currentUserSharing.updatedAt
        } : null,
        otherUser: otherUserSharing ? {
          userId: otherUserSharing.userId,
          name: otherUserSharing.user.name,
          isSharing: otherUserSharing.isSharing,
          latitude: otherUserSharing.latitude,
          longitude: otherUserSharing.longitude,
          accuracy: otherUserSharing.accuracy,
          sharedAt: otherUserSharing.sharedAt,
          updatedAt: otherUserSharing.updatedAt
        } : null
      };
    }),

  // Start sharing location for a conversation
  startSharing: authroizedProcedure
    .input(z.object({
      conversationId: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;
      
      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        select: { seekerId: true, helperId: true }
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      if (conversation.seekerId !== userId && conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access this conversation" });
      }

      // Upsert location sharing record
      const locationSharing = await ctx.db.conversationLocationSharing.upsert({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId
          }
        },
        update: {
          isSharing: true,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          sharedAt: new Date(),
          stoppedAt: null,
        },
        create: {
          conversationId: input.conversationId,
          userId,
          isSharing: true,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          sharedAt: new Date(),
        }
      });

      return locationSharing;
    }),

  // Stop sharing location for a conversation
  stopSharing: authroizedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;
      
      // Verify user is part of the conversation
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        select: { seekerId: true, helperId: true }
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
      }

      if (conversation.seekerId !== userId && conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to access this conversation" });
      }

      // Update location sharing record to stop sharing
      const locationSharing = await ctx.db.conversationLocationSharing.upsert({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId
          }
        },
        update: {
          isSharing: false,
          stoppedAt: new Date(),
          // Keep location data for reference but mark as not sharing
        },
        create: {
          conversationId: input.conversationId,
          userId,
          isSharing: false,
          stoppedAt: new Date(),
        }
      });

      return locationSharing;
    }),

  // Update location (for users who are already sharing)
  updateLocation: authroizedProcedure
    .input(z.object({
      conversationId: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      accuracy: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;
      
      // Check if user is currently sharing location for this conversation
      const existingSharing = await ctx.db.conversationLocationSharing.findUnique({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId
          }
        }
      });

      if (!existingSharing || !existingSharing.isSharing) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Location sharing is not active for this conversation" 
        });
      }

      // Update location data
      const updatedSharing = await ctx.db.conversationLocationSharing.update({
        where: {
          conversationId_userId: {
            conversationId: input.conversationId,
            userId
          }
        },
        data: {
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        }
      });

      return updatedSharing;
    }),
});
