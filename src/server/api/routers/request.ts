import { z } from "zod";
import { authroizedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { RequestStatus, InterestStatus } from "@prisma/client";
import { calculateDistance } from "./user";
// @ts-ignore
// import FCM from 'fcm-node';

// // TODO: Add your FCM server key to your environment variables
// const fcm = new FCM(process.env.FCM_SERVER_KEY);

export const requestRouter = createTRPCRouter({
  create: authroizedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seekerId = ctx.supabaseUser!.id;

      const user = await ctx.db.user.findUnique({
        where: { id: seekerId },
      });

      if (!user?.isSeeker) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must set up your seeker profile to create requests.",
        });
      }

      const request = await ctx.db.request.create({
        data: {
          seekerId,
          title: input.title,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          status: "OPEN",
        },
      });

      return request;
    }),

  getAllOpen: authroizedProcedure.query(async ({ ctx }) => {
    const openRequests = await ctx.db.request.findMany({
      where: {
        status: "OPEN",
      },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

        return openRequests;
  }),

  getMySeekerRequests: authroizedProcedure
    .query(async ({ ctx }) => {
      const seekerId = ctx.supabaseUser!.id;
      const requests = await ctx.db.request.findMany({
        where: { seekerId },
        orderBy: { createdAt: 'desc' },
                include: {
          _count: { select: { interests: true } },
          conversation: true,
        },
      });
      return requests;
    }),

  getMyHelperInterests: authroizedProcedure
    .query(async ({ ctx }) => {
      const helperId = ctx.supabaseUser!.id;
      
      const interests = await ctx.db.requestInterest.findMany({
        where: { helperId },
        include: {
          request: {
            include: {
              seeker: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
              conversation: {
                select: { id: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get rejection reasons for rejected interests
      const rejectedInterests = interests.filter(i => i.status === 'REJECTED');
      const rejections = rejectedInterests.length > 0 ? await ctx.db.requestRejection.findMany({
        where: {
          helperId,
          requestId: { in: rejectedInterests.map(i => i.requestId) },
        },
        select: {
          requestId: true,
          reason: true,
          createdAt: true,
        },
      }) : [];

      const rejectionMap = new Map(rejections.map(r => [r.requestId, r]));

      // Calculate distances if user has location
      const userLocation = await ctx.db.userLocation.findUnique({
        where: { userId: helperId },
        select: { latitude: true, longitude: true },
      });

      return interests.map(interest => ({
        ...interest,
        rejectionReason: rejectionMap.get(interest.requestId)?.reason || null,
        rejectedAt: rejectionMap.get(interest.requestId)?.createdAt || null,
        distance: userLocation && interest.request.latitude && interest.request.longitude 
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              interest.request.latitude,
              interest.request.longitude
            )
          : null,
      }));
    }),

  getInterestedHelpers: authroizedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const interests = await ctx.db.requestInterest.findMany({
        where: { requestId: input.requestId },
        include: {
          helper: {
            include: { helperProfile: true },
          },
        },
      });
      return interests.map(i => i.helper);
    }),

  expressInterest: authroizedProcedure
    .input(z.object({ 
      requestId: z.string(),
      message: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const helperId = ctx.supabaseUser!.id;

      const user = await ctx.db.user.findUnique({
        where: { id: helperId },
      });

      if (!user?.isHelper) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must set up your helper profile to express interest.",
        });
      }

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId },
        include: { rejections: true }
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found." });
      }

      if (request.status === RequestStatus.CLOSED) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "This request has been closed by the seeker." 
        });
      }

      // Check if helper was previously rejected
      const wasRejected = request.rejections.some(r => r.helperId === helperId);
      if (wasRejected) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "You were previously rejected for this request." 
        });
      }

      // Check if interest already exists
      const existingInterest = await ctx.db.requestInterest.findUnique({
        where: {
          requestId_helperId: {
            requestId: input.requestId,
            helperId
          }
        }
      });

      if (existingInterest) {
        if (existingInterest.status === InterestStatus.WITHDRAWN) {
          // Allow re-expressing interest if previously withdrawn
          const updatedInterest = await ctx.db.requestInterest.update({
            where: { id: existingInterest.id },
            data: {
              status: InterestStatus.PENDING,
              message: input.message,
              updatedAt: new Date()
            }
          });
          return updatedInterest;
        } else {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "You have already expressed interest in this request." 
          });
        }
      }

      const interest = await ctx.db.requestInterest.create({
        data: {
          requestId: input.requestId,
          helperId,
          message: input.message,
          status: InterestStatus.PENDING
        },
      });

      // Send notification to seeker
      const seeker = await ctx.db.user.findUnique({
        where: { id: request.seekerId },
        select: { pushToken: true },
      });

      if (seeker?.pushToken) {
        const message = {
          to: seeker.pushToken,
          notification: {
            title: 'New Interest in Your Request!',
            body: `${user.name} is interested in helping you.`,
          },
        };
        console.log("Message", message);
      }

      return interest;
    }),

  confirmHelper: authroizedProcedure
    .input(
      z.object({
        requestId: z.string(),
        helperId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const seekerId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.seekerId !== seekerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to confirm a helper for this request.",
        });
      }

      if (request.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This request is no longer open.",
        });
      }

      const updatedRequest = await ctx.db.request.update({
        where: { id: input.requestId },
        data: {
          helperId: input.helperId,
          status: RequestStatus.UNDER_REVIEW,
        },
      });

            // Create a conversation for the chat
      if (updatedRequest.helperId) {
        const conversation = await ctx.db.conversation.create({
          data: {
            requestId: updatedRequest.id,
            seekerId: updatedRequest.seekerId,
            helperId: updatedRequest.helperId,
          },
        });

        // Link the conversation back to the request
        await ctx.db.request.update({
          where: { id: updatedRequest.id },
          data: { conversationId: conversation.id },
        });
      }

      return updatedRequest;
    }),

  // New enhanced endpoints for request lifecycle management

  // Close request by seeker
  closeRequest: authroizedProcedure
    .input(z.object({
      requestId: z.string(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const seekerId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId }
      });

      if (!request || request.seekerId !== seekerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to close this request."
        });
      }

      if (request.status === RequestStatus.CLOSED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request is already closed."
        });
      }

      const updatedRequest = await ctx.db.request.update({
        where: { id: input.requestId },
        data: {
          status: RequestStatus.CLOSED,
          closedAt: new Date(),
          closedReason: input.reason
        }
      });

      return updatedRequest;
    }),

  // Accept helper interest (move to reviewing/bargaining)
  acceptInterest: authroizedProcedure
    .input(z.object({
      requestId: z.string(),
      helperId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const seekerId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId }
      });

      if (!request || request.seekerId !== seekerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to accept interest for this request."
        });
      }

      if (request.status !== RequestStatus.OPEN) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Request is not open for new interests."
        });
      }

      // Update the interest status
      await ctx.db.requestInterest.update({
        where: {
          requestId_helperId: {
            requestId: input.requestId,
            helperId: input.helperId
          }
        },
        data: {
          status: InterestStatus.ACCEPTED
        }
      });

      // Update request status and assign helper
      const updatedRequest = await ctx.db.request.update({
        where: { id: input.requestId },
        data: {
          status: RequestStatus.UNDER_REVIEW,
          helperId: input.helperId
        }
      });

      // Create conversation
      const conversation = await ctx.db.conversation.create({
        data: {
          requestId: input.requestId,
          seekerId: request.seekerId,
          helperId: input.helperId
        }
      });

      // Link conversation to request
      await ctx.db.request.update({
        where: { id: input.requestId },
        data: { conversationId: conversation.id }
      });

      return updatedRequest;
    }),

  // Reject helper interest
  rejectInterest: authroizedProcedure
    .input(z.object({
      requestId: z.string(),
      helperId: z.string(),
      reason: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const seekerId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId }
      });

      if (!request || request.seekerId !== seekerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to reject interest for this request."
        });
      }

      // Update interest status to rejected
      await ctx.db.requestInterest.update({
        where: {
          requestId_helperId: {
            requestId: input.requestId,
            helperId: input.helperId
          }
        },
        data: {
          status: InterestStatus.REJECTED
        }
      });

      // Create rejection record
      await ctx.db.requestRejection.create({
        data: {
          requestId: input.requestId,
          helperId: input.helperId,
          seekerId: request.seekerId,
          reason: input.reason
        }
      });

      return { success: true };
    }),

  // Get request with full details including interests and rejections
  getRequestDetails: authroizedProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId },
        include: {
          seeker: {
            select: { id: true, name: true, profilePicture: true }
          },
          helper: {
            select: { id: true, name: true, profilePicture: true }
          },
          interests: {
            include: {
              helper: {
                include: {
                  helperProfile: {
                    include: { expertise: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          rejections: {
            include: {
              helper: {
                select: { id: true, name: true }
              }
            }
          },
          conversation: true
        }
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found." });
      }

      // Check if user has access to this request
      const hasAccess = request.seekerId === userId || 
                       request.helperId === userId ||
                       request.interests.some(i => i.helperId === userId);

      if (!hasAccess) {
        // Return limited info for non-participants
        return {
          id: request.id,
          title: request.title,
          description: request.description,
          status: request.status,
          createdAt: request.createdAt,
          seeker: request.seeker,
          interests: [],
          isRejected: request.rejections.some(r => r.helperId === userId)
        };
      }

      return request;
    }),

  // Withdraw interest by helper
  withdrawInterest: authroizedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const helperId = ctx.supabaseUser!.id;

      const interest = await ctx.db.requestInterest.findUnique({
        where: {
          requestId_helperId: {
            requestId: input.requestId,
            helperId
          }
        }
      });

      if (!interest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interest not found."
        });
      }

      if (interest.status === InterestStatus.ACCEPTED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot withdraw accepted interest. Contact the seeker."
        });
      }

      await ctx.db.requestInterest.update({
        where: { id: interest.id },
        data: { status: InterestStatus.WITHDRAWN }
      });

      return { success: true };
    }),

  // Update request status (for bargaining flow integration)
  updateRequestStatus: authroizedProcedure
    .input(z.object({
      requestId: z.string(),
      status: z.enum(['BARGAINING', 'CONFIRMED', 'COMPLETED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const request = await ctx.db.request.findUnique({
        where: { id: input.requestId }
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found." });
      }

      // Only seeker or assigned helper can update status
      if (request.seekerId !== userId && request.helperId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this request status."
        });
      }

      const updatedRequest = await ctx.db.request.update({
        where: { id: input.requestId },
        data: { status: input.status as RequestStatus }
      });

      return updatedRequest;
    }),
});
