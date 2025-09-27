-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'BARGAINING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."InterestStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."BargainStatus" AS ENUM ('PENDING_HELPER_RESPONSE', 'PENDING_SEEKER_RESPONSE', 'AGREED', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePicture" TEXT,
    "mobileNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "primaryLocation" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "pushToken" TEXT,
    "currentRole" TEXT,
    "isHelper" BOOLEAN NOT NULL DEFAULT false,
    "isSeeker" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Request" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "seekerId" TEXT NOT NULL,
    "helperId" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'OPEN',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RequestInterest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,
    "status" "public"."InterestStatus" NOT NULL DEFAULT 'PENDING',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RequestRejection" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestRejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelperProfile" (
    "userId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelperProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."SeekerProfile" (
    "userId" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "additionalInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeekerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Expertise" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" TEXT NOT NULL,
    "ratingValue" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" SMALLINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "helperProfileId" TEXT,
    "seekerProfileId" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationLocationSharing" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "isSharing" BOOLEAN NOT NULL DEFAULT false,
    "sharedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationLocationSharing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bargain" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL,
    "status" "public"."BargainStatus" NOT NULL DEFAULT 'PENDING_HELPER_RESPONSE',
    "initiatedBy" TEXT NOT NULL,
    "helperApproved" BOOLEAN NOT NULL DEFAULT false,
    "seekerApproved" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bargain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BargainOffer" (
    "id" TEXT NOT NULL,
    "bargainId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "offeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BargainOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceTransaction" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "serviceStatus" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "seekerId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bothFeedbacksCompleted" BOOLEAN NOT NULL DEFAULT false,
    "helperFeedbackAt" TIMESTAMP(3),
    "helperFeedbackProvided" BOOLEAN NOT NULL DEFAULT false,
    "seekerFeedbackAt" TIMESTAMP(3),
    "seekerFeedbackProvided" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ServiceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "public"."User"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Request_conversationId_key" ON "public"."Request"("conversationId");

-- CreateIndex
CREATE INDEX "Request_seekerId_idx" ON "public"."Request"("seekerId");

-- CreateIndex
CREATE INDEX "Request_helperId_idx" ON "public"."Request"("helperId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "public"."Request"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_requestId_key" ON "public"."Conversation"("requestId");

-- CreateIndex
CREATE INDEX "Conversation_requestId_idx" ON "public"."Conversation"("requestId");

-- CreateIndex
CREATE INDEX "Conversation_seekerId_idx" ON "public"."Conversation"("seekerId");

-- CreateIndex
CREATE INDEX "Conversation_helperId_idx" ON "public"."Conversation"("helperId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "public"."Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "RequestInterest_requestId_idx" ON "public"."RequestInterest"("requestId");

-- CreateIndex
CREATE INDEX "RequestInterest_helperId_idx" ON "public"."RequestInterest"("helperId");

-- CreateIndex
CREATE INDEX "RequestInterest_status_idx" ON "public"."RequestInterest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RequestInterest_requestId_helperId_key" ON "public"."RequestInterest"("requestId", "helperId");

-- CreateIndex
CREATE INDEX "RequestRejection_requestId_idx" ON "public"."RequestRejection"("requestId");

-- CreateIndex
CREATE INDEX "RequestRejection_helperId_idx" ON "public"."RequestRejection"("helperId");

-- CreateIndex
CREATE INDEX "RequestRejection_seekerId_idx" ON "public"."RequestRejection"("seekerId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestRejection_requestId_helperId_key" ON "public"."RequestRejection"("requestId", "helperId");

-- CreateIndex
CREATE INDEX "Expertise_helperId_idx" ON "public"."Expertise"("helperId");

-- CreateIndex
CREATE INDEX "Rating_fromUserId_idx" ON "public"."Rating"("fromUserId");

-- CreateIndex
CREATE INDEX "Rating_toUserId_idx" ON "public"."Rating"("toUserId");

-- CreateIndex
CREATE INDEX "Rating_transactionId_idx" ON "public"."Rating"("transactionId");

-- CreateIndex
CREATE INDEX "Feedback_helperProfileId_idx" ON "public"."Feedback"("helperProfileId");

-- CreateIndex
CREATE INDEX "Feedback_seekerProfileId_idx" ON "public"."Feedback"("seekerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_key" ON "public"."UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "public"."UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_isEnabled_idx" ON "public"."UserLocation"("isEnabled");

-- CreateIndex
CREATE INDEX "ConversationLocationSharing_conversationId_idx" ON "public"."ConversationLocationSharing"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationLocationSharing_userId_idx" ON "public"."ConversationLocationSharing"("userId");

-- CreateIndex
CREATE INDEX "ConversationLocationSharing_isSharing_idx" ON "public"."ConversationLocationSharing"("isSharing");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationLocationSharing_conversationId_userId_key" ON "public"."ConversationLocationSharing"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Bargain_conversationId_idx" ON "public"."Bargain"("conversationId");

-- CreateIndex
CREATE INDEX "Bargain_initiatedBy_idx" ON "public"."Bargain"("initiatedBy");

-- CreateIndex
CREATE INDEX "Bargain_status_idx" ON "public"."Bargain"("status");

-- CreateIndex
CREATE INDEX "BargainOffer_bargainId_idx" ON "public"."BargainOffer"("bargainId");

-- CreateIndex
CREATE INDEX "BargainOffer_offeredBy_idx" ON "public"."BargainOffer"("offeredBy");

-- CreateIndex
CREATE INDEX "BargainOffer_createdAt_idx" ON "public"."BargainOffer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTransaction_conversationId_key" ON "public"."ServiceTransaction"("conversationId");

-- CreateIndex
CREATE INDEX "ServiceTransaction_conversationId_idx" ON "public"."ServiceTransaction"("conversationId");

-- CreateIndex
CREATE INDEX "ServiceTransaction_seekerId_idx" ON "public"."ServiceTransaction"("seekerId");

-- CreateIndex
CREATE INDEX "ServiceTransaction_helperId_idx" ON "public"."ServiceTransaction"("helperId");

-- CreateIndex
CREATE INDEX "ServiceTransaction_seekerFeedbackProvided_idx" ON "public"."ServiceTransaction"("seekerFeedbackProvided");

-- CreateIndex
CREATE INDEX "ServiceTransaction_helperFeedbackProvided_idx" ON "public"."ServiceTransaction"("helperFeedbackProvided");

-- CreateIndex
CREATE INDEX "ServiceTransaction_bothFeedbacksCompleted_idx" ON "public"."ServiceTransaction"("bothFeedbacksCompleted");

-- CreateIndex
CREATE INDEX "ServiceTransaction_serviceStatus_idx" ON "public"."ServiceTransaction"("serviceStatus");

-- CreateIndex
CREATE INDEX "ServiceTransaction_paymentStatus_idx" ON "public"."ServiceTransaction"("paymentStatus");

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestInterest" ADD CONSTRAINT "RequestInterest_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestInterest" ADD CONSTRAINT "RequestInterest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestRejection" ADD CONSTRAINT "RequestRejection_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestRejection" ADD CONSTRAINT "RequestRejection_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RequestRejection" ADD CONSTRAINT "RequestRejection_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HelperProfile" ADD CONSTRAINT "HelperProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeekerProfile" ADD CONSTRAINT "SeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Expertise" ADD CONSTRAINT "Expertise_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."HelperProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."ServiceTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_helperProfileId_fkey" FOREIGN KEY ("helperProfileId") REFERENCES "public"."HelperProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_seekerProfileId_fkey" FOREIGN KEY ("seekerProfileId") REFERENCES "public"."SeekerProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationLocationSharing" ADD CONSTRAINT "ConversationLocationSharing_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationLocationSharing" ADD CONSTRAINT "ConversationLocationSharing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bargain" ADD CONSTRAINT "Bargain_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bargain" ADD CONSTRAINT "Bargain_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BargainOffer" ADD CONSTRAINT "BargainOffer_bargainId_fkey" FOREIGN KEY ("bargainId") REFERENCES "public"."Bargain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BargainOffer" ADD CONSTRAINT "BargainOffer_offeredBy_fkey" FOREIGN KEY ("offeredBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceTransaction" ADD CONSTRAINT "ServiceTransaction_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceTransaction" ADD CONSTRAINT "ServiceTransaction_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceTransaction" ADD CONSTRAINT "ServiceTransaction_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
