"use client"

import * as React from "react"
import { motion, AnimatePresence, Variants, ViewportOptions } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  variant?: "slide" | "fade" | "scale" | "blur"
}

const transitionVariants = {
  slide: {
    initial: { opacity: 0, x: 20, y: 20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: -20, y: -20 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(8px)" },
  },
}

export function PageTransition({ 
  children, 
  className, 
  variant = "slide" 
}: PageTransitionProps) {
  return (
    <motion.div
      className={cn("w-full", className)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={transitionVariants[variant]}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredAnimationProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggeredAnimation({
  children,
  className,
  staggerDelay = 0.1,
}: StaggeredAnimationProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants as unknown as Variants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      viewport={{ threshold, once } as unknown as ViewportOptions}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 30,
}: FadeInProps) {
  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...directionMap[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxScrollProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

export function ParallaxScroll({
  children,
  className,
  speed = 0.5,
}: ParallaxScrollProps) {
  return (
    <motion.div
      className={className}
      style={{
        y: `${speed * -100}%`,
      }}
      transition={{ type: "spring", stiffness: 100, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}
