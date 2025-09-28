"use client";

import { Suspense } from "react"
import { motion } from "framer-motion"
import { DashboardStats, DashboardActions } from "@/components/dashboard"
import { MyRequests, MyInterests, PendingFeedbacks } from "@/components/features"
import { ContentLoader } from "@/components/loading"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { FadeIn, StaggeredAnimation } from "@/components/ui/page-transition"
import { FloatingElements, ParticleField } from "@/components/ui/floating-elements"
import { useAuth } from "@/components/providers/auth-provider"

export default function DashboardIndex() {
  const { userData } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* Subtle background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <ParticleField density={15} />
        <FloatingElements count={3} className="opacity-30" />
      </div>

      <motion.div 
        className="relative z-10 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <FadeIn delay={0.1}>
          <Suspense fallback={<ContentLoader />}>
            <DashboardStats />
          </Suspense>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <Suspense fallback={<ContentLoader />}>
            <DashboardActions />
          </Suspense>
        </FadeIn>

        <StaggeredAnimation staggerDelay={0.1}>
          {/* Show My Requests for seekers */}
          {userData?.isSeeker && (
            <Suspense fallback={<ContentLoader />}>
              <AnimatedCard 
                variant="glass" 
                className="overflow-hidden hover-lift"
                delay={0}
              >
                <AnimatedCardHeader className="pb-3">
                  <AnimatedCardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    My Requests
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent className="p-3 sm:p-6">
                  <MyRequests />
                </AnimatedCardContent>
              </AnimatedCard>
            </Suspense>
          )}

          {/* Show My Interests for helpers */}
          {userData?.isHelper && (
            <Suspense fallback={<ContentLoader />}>
              <AnimatedCard 
                variant="glass" 
                className="overflow-hidden hover-lift"
                delay={1}
              >
                <AnimatedCardHeader className="pb-3">
                  <AnimatedCardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 bg-secondary rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    My Interested Requests
                  </AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent className="p-3 sm:p-6">
                  <MyInterests />
                </AnimatedCardContent>
              </AnimatedCard>
            </Suspense>
          )}

          {/* Pending Feedbacks - Show for all users */}
          <Suspense fallback={<ContentLoader />}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PendingFeedbacks />
            </motion.div>
          </Suspense>
        </StaggeredAnimation>
      </motion.div>
    </div>
  )
}