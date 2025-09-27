import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  authroizedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: authroizedProcedure
    .query(async ({ ctx }) => {
      const supabaseUser = ctx.supabaseUser!;
      let user = await ctx.db.user.findUnique({
        where: { id: supabaseUser.id },
        include: {
          helperProfile: {
            include: {
              expertise: true,
            },
          },
          seekerProfile: true,
        },
      });

      if (!user) {
        user = await ctx.db.user.create({
          data: {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email || "User",
            hasCompletedOnboarding: false,
          },
          include: {
            helperProfile: {
              include: {
                expertise: true,
              },
            },
            seekerProfile: true,
          },
        });
      }

      return user;
    }),

  updateProfile: authroizedProcedure
    .input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      mobileNumber: z.string().min(10, "Please enter a valid mobile number"),
      primaryLocation: z.string().min(2, "Please enter your primary location"),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      const user = await ctx.db.user.update({
        where: { id: supabaseUser.id },
        data: {
          name: input.name,
          mobileNumber: input.mobileNumber,
          primaryLocation: input.primaryLocation,
        },
      });
      return user;
    }),

  switchToRole: authroizedProcedure
    .input(z.object({
      role: z.enum(["HELPER", "SEEKER"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      
      // Check if user has the required profile set up
      const user = await ctx.db.user.findUnique({
        where: { id: supabaseUser.id },
        include: {
          helperProfile: true,
          seekerProfile: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      // Check if user has the required profile
      if (input.role === "HELPER" && !user.helperProfile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "NEED_HELPER_PROFILE",
        });
      }

      if (input.role === "SEEKER" && !user.seekerProfile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED", 
          message: "NEED_SEEKER_PROFILE",
        });
      }

      // Update current role
      const updatedUser = await ctx.db.user.update({
        where: { id: supabaseUser.id },
        data: {
          currentRole: input.role,
        },
      });
      
      return updatedUser;
    }),

  createHelperProfile: authroizedProcedure
    .input(z.object({
      skills: z.array(z.object({
        skillName: z.string().min(1, "Skill name is required"),
        description: z.string().optional(),
      })).min(1, "Please add at least one skill"),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      // First create the helper profile
      const helperProfile = await ctx.db.helperProfile.create({
        data: {
          userId: supabaseUser.id,
          additionalInfo: input.additionalInfo,
        },
      });

      // Then create the expertise entries
      if (input.skills.length > 0) {
        await ctx.db.expertise.createMany({
          data: input.skills.map(skill => ({
            helperId: supabaseUser.id,
            skillName: skill.skillName,
            description: skill.description,
          })),
        });
      }

      // Mark onboarding as completed, enable helper role, and set as current role
      await ctx.db.user.update({
        where: { id: supabaseUser.id },
        data: {
          hasCompletedOnboarding: true,
          isHelper: true,
          currentRole: "HELPER",
        },
      });

      return helperProfile;
    }),

  createSeekerProfile: authroizedProcedure
    .input(z.object({
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      const seekerProfile = await ctx.db.seekerProfile.create({
        data: {
          userId: supabaseUser.id,
          additionalInfo: input.additionalInfo,
        },
      });

      // Mark onboarding as completed, enable seeker role, and set as current role
      await ctx.db.user.update({
        where: { id: supabaseUser.id },
        data: {
          hasCompletedOnboarding: true,
          isSeeker: true,
          currentRole: "SEEKER",
        },
      });

      return seekerProfile;
    }),

  updateLocation: authroizedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      const location = await ctx.db.userLocation.upsert({
        where: { userId: supabaseUser.id },
        update: {
          latitude: input.latitude,
          longitude: input.longitude,
          isEnabled: true,
        },
        create: {
          userId: supabaseUser.id,
          latitude: input.latitude,
          longitude: input.longitude,
          isEnabled: true,
        },
      });
      
      return location;
    }),

  getNearbyUsers: authroizedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(10), // Default 10km radius
    }))
    .query(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      // Calculate bounding box coordinates for initial filtering
      const latDiff = input.radiusKm / 111.32; // 1 degree latitude is ~111.32 km
      const lonDiff = input.radiusKm / (111.32 * Math.cos(input.latitude * Math.PI / 180));
      
      const minLat = input.latitude - latDiff;
      const maxLat = input.latitude + latDiff;
      const minLon = input.longitude - lonDiff;
      const maxLon = input.longitude + lonDiff;
      
      // First, filter users within the bounding box using database query
      const users = await ctx.db.user.findMany({
        where: {
          id: { not: supabaseUser.id }, // Exclude current user
          location: {
            isEnabled: true,
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLon, lte: maxLon },
          },
        },
        select: {
          id: true,
          name: true,
          profilePicture: true,
          isHelper: true,
          isSeeker: true,
          location: {
            select: {
              latitude: true,
              longitude: true,
              updatedAt: true,
            },
          },
        },
      });      

      // Then apply precise distance calculation to the pre-filtered results
      const nearbyUsers = users.map((user) => {
          if (!user.location) return null;

          const distance = calculateDistance(
            input.latitude,
            input.longitude,
            user.location.latitude,
            user.location.longitude
          );

          // if (distance > input.radiusKm) return null;
          
          return {
            id: user.id,
            name: user.name,
            profilePicture: user.profilePicture,
            latitude: user.location.latitude,
            longitude: user.location.longitude,
            isHelper: user.isHelper,
            isSeeker: user.isSeeker,
            updatedAt: user.location.updatedAt,
            distance,
          };
        })
        .filter((user) => user !== null)

      return nearbyUsers;
    }),

  updatePushToken: authroizedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      await ctx.db.user.update({
        where: { id: supabaseUser.id },
        data: { pushToken: input.token },
      });
      return { success: true };
    }),

  findNearbyHelpers: authroizedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      
      // Calculate bounding box coordinates
      const latDiff = input.radiusKm / 111.32;
      const lonDiff = input.radiusKm / (111.32 * Math.cos(input.latitude * Math.PI / 180));
      
      const minLat = input.latitude - latDiff;
      const maxLat = input.latitude + latDiff;
      const minLon = input.longitude - lonDiff;
      const maxLon = input.longitude + lonDiff;
      
      const helpers = await ctx.db.user.findMany({
        where: {
          id: { not: supabaseUser.id },
          isHelper: true,
          helperProfile: { isNot: null },
          location: {
            isEnabled: true,
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLon, lte: maxLon },
          },
        },
        include: {
          helperProfile: {
            include: {
              expertise: true,
            },
          },
          location: true,
        },
      });

      return helpers
        .map((helper) => {
          if (!helper.location) return null;

          const distance = calculateDistance(
            input.latitude,
            input.longitude,
            helper.location.latitude,
            helper.location.longitude
          );

          if (distance > input.radiusKm) return null;

          return {
            id: helper.id,
            name: helper.name,
            profilePicture: helper.profilePicture,
            averageRating: helper.helperProfile?.averageRating,
            expertise: helper.helperProfile?.expertise || [],
            distance,
            isOnline: isRecentlyActive(helper.location.updatedAt),
            responseTime: "Usually responds within 1 hour", // TODO: Calculate from actual data
            completedJobs: 0, // TODO: Calculate from completed requests
          };
        })
        .filter((helper) => helper !== null)
        .sort((a, b) => a.distance - b.distance);
    }),

  findNearbySeekers: authroizedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const supabaseUser = ctx.supabaseUser!;
      
      // Calculate bounding box coordinates
      const latDiff = input.radiusKm / 111.32;
      const lonDiff = input.radiusKm / (111.32 * Math.cos(input.latitude * Math.PI / 180));
      
      const minLat = input.latitude - latDiff;
      const maxLat = input.latitude + latDiff;
      const minLon = input.longitude - lonDiff;
      const maxLon = input.longitude + lonDiff;
      
      const seekers = await ctx.db.user.findMany({
        where: {
          id: { not: supabaseUser.id },
          isSeeker: true,
          seekerProfile: { isNot: null },
          location: {
            isEnabled: true,
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLon, lte: maxLon },
          },
          requestsMade: {
            some: {
              status: {
                in: ["OPEN", "UNDER_REVIEW", "BARGAINING"]
              },
            },
          },
        },
        include: {
          seekerProfile: true,
          location: true,
          requestsMade: {
            where: {
              status: {
                in: ["OPEN", "UNDER_REVIEW", "BARGAINING"]
              },
            },
            include: {
              interests: {
                where: { helperId: supabaseUser.id },
                select: { status: true }
              },
              rejections: {
                where: { helperId: supabaseUser.id },
                select: { reason: true, createdAt: true }
              }
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      return seekers
        .map((seeker) => {
          if (!seeker.location || seeker.requestsMade.length === 0) return null;

          const distance = calculateDistance(
            input.latitude,
            input.longitude,
            seeker.location.latitude,
            seeker.location.longitude
          );

          if (distance > input.radiusKm) return null;

          return {
            id: seeker.id,
            name: seeker.name,
            profilePicture: seeker.profilePicture,
            averageRating: seeker.seekerProfile?.averageRating,
            distance,
            isOnline: isRecentlyActive(seeker.location.updatedAt),
            activeRequests: seeker.requestsMade.map(request => ({
              id: request.id,
              title: request.title,
              description: request.description,
              status: request.status,
              createdAt: request.createdAt.toISOString(),
              // Helper-specific information
              conversationId: request.conversationId,
              myInterestStatus: request.interests[0]?.status || null,
              isRejected: request.rejections.length > 0,
              rejectionReason: request.rejections[0]?.reason || null,
              rejectedAt: request.rejections[0]?.createdAt?.toISOString() || null,
            })),
          };
        })
        .filter((seeker) => seeker !== null)
        .sort((a, b) => a.distance - b.distance);
    }),
});

// Helper function to calculate distance between two points in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to check if user is recently active (within last 30 minutes)
function isRecentlyActive(lastUpdated: Date): boolean {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return lastUpdated > thirtyMinutesAgo;
}