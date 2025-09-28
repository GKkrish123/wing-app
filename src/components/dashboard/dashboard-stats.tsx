"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { clientApi } from "@/trpc/react"
import { motion } from "framer-motion"
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card"
import { StaggeredAnimation, FadeIn } from "@/components/ui/page-transition"
import { MapPin, Users, MessageCircle, AlertTriangle, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContentLoader } from "@/components/loading"

export function DashboardStats() {
  const { userData, userDataLoading } = useAuth()
  const { data: pendingFeedbacks } = clientApi.payment.getPendingFeedbacks.useQuery()

  if (userDataLoading) {
    return <ContentLoader />
  }

  if (!userData) return null

  const totalPendingFeedbacks = (pendingFeedbacks?.asSeeker?.length || 0) + (pendingFeedbacks?.asHelper?.length || 0)

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <FadeIn delay={0.1}>
        <div className="relative">
          <motion.div
            className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="space-y-2">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome back, {userData.name}! 
              <motion.span
                className="inline-block ml-2"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Here&apos;s your personalized dashboard with everything happening in your Wing world today.
            </motion.p>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Quick Stats */}
      <StaggeredAnimation staggerDelay={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard 
          variant="gradient" 
          className="hover-lift group cursor-pointer border-0"
          delay={0}
        >
          <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <AnimatedCardTitle className="text-sm font-medium text-card-foreground/80">Current Role</AnimatedCardTitle>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Users className="h-5 w-5 text-primary" />
            </motion.div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <motion.div 
              className="text-3xl font-bold text-card-foreground mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            >
              {userData.currentRole === "HELPER" ? "Helper" : 
               userData.currentRole === "SEEKER" ? "Seeker" : "Not Set"}
            </motion.div>
            <p className="text-sm text-card-foreground/70">
              {userData.isHelper && userData.isSeeker ? "Can switch between both" : "Active mode"}
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard 
          variant="gradient" 
          className="hover-lift group cursor-pointer border-0"
          delay={1}
        >
          <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <AnimatedCardTitle className="text-sm font-medium text-card-foreground/80">Location Status</AnimatedCardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="h-5 w-5 text-secondary" />
            </motion.div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <motion.div 
              className="text-3xl font-bold text-card-foreground mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            >
              {userData.primaryLocation ? "Active" : "Pending"}
            </motion.div>
            <p className="text-sm text-card-foreground/70 truncate">
              {userData.primaryLocation || "Update your location"}
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard 
          variant="gradient" 
          className="hover-lift group cursor-pointer border-0"
          delay={2}
        >
          <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <AnimatedCardTitle className="text-sm font-medium text-card-foreground/80">Active Chats</AnimatedCardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageCircle className="h-5 w-5 text-accent" />
            </motion.div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <motion.div 
              className="text-3xl font-bold text-card-foreground mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >
              0
            </motion.div>
            <p className="text-sm text-card-foreground/70">
              Conversations
            </p>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard 
          variant="gradient"
          className="hover-lift group cursor-pointer border-0 relative overflow-hidden"
          delay={3}
        >
          {totalPendingFeedbacks > 0 && (
            <motion.div
              className="absolute top-2 right-2 w-3 h-3 bg-destructive rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <AnimatedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <AnimatedCardTitle className="text-sm font-medium text-card-foreground/80">Pending Items</AnimatedCardTitle>
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={totalPendingFeedbacks > 0 ? { 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.05, 1] 
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertTriangle className={`h-5 w-5 ${totalPendingFeedbacks > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </motion.div>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <motion.div 
              className="text-3xl font-bold text-card-foreground mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
            >
              {totalPendingFeedbacks}
            </motion.div>
            <p className="text-sm text-card-foreground/70">
              {totalPendingFeedbacks === 0 ? (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  All caught up!
                </span>
              ) : "Need your feedback"}
            </p>
          </AnimatedCardContent>
        </AnimatedCard>
      </StaggeredAnimation>
    </div>
  )
}
