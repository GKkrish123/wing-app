"use client"

import * as React from "react"
import { motion, type HTMLMotionProps, type Transition, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAccessibleAnimation } from "@/hooks/use-reduced-motion"

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "glass" | "gradient" | "hover-lift"
  delay?: number
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: delay * 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

const variantClasses = {
  default: "bg-card text-card-foreground border shadow-sm",
  glass: "glass border-white/20 shadow-xl",
  gradient: "bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20 shadow-lg",
  "hover-lift": "bg-card text-card-foreground border shadow-sm hover-lift"
}

function AnimatedCard({ 
  className, 
  variant = "default",
  delay = 0,
  children,
  ...props 
}: AnimatedCardProps) {
  const { prefersReducedMotion, transition } = useAccessibleAnimation()
  
  return (
    <motion.div
      className={cn(
        "flex flex-col gap-6 rounded-xl py-6",
        variantClasses[variant],
        className
      )}
      variants={prefersReducedMotion ? {} : cardVariants as unknown as Variants}
      initial={prefersReducedMotion ? false : "hidden"}
      animate={prefersReducedMotion ? false : "visible"}
      whileHover={variant === "hover-lift" && !prefersReducedMotion ? "hover" : undefined}
      custom={delay}
      transition={transition as Transition<any>}
      {...props as HTMLMotionProps<"div">}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCardHeader({ 
  className, 
  children,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <motion.div
      className={cn("flex flex-col space-y-1.5 px-6", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      {...props as HTMLMotionProps<"div">}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCardTitle({ 
  className, 
  children,
  ...props 
}: React.ComponentProps<"h3">) {
  return (
    <motion.h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      {...props as HTMLMotionProps<"h3">}
    >
      {children}
    </motion.h3>
  )
}

function AnimatedCardDescription({ 
  className, 
  children,
  ...props 
}: React.ComponentProps<"p">) {
  return (
    <motion.p
      className={cn("text-sm text-muted-foreground", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      {...props as HTMLMotionProps<"p">}
    >
      {children}
    </motion.p>
  )
}

function AnimatedCardContent({ 
  className, 
  children,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <motion.div
      className={cn("px-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      {...props as HTMLMotionProps<"div">}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCardFooter({ 
  className, 
  children,
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <motion.div
      className={cn("flex items-center px-6", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      {...props as HTMLMotionProps<"div">}
    >
      {children}
    </motion.div>
  )
}

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
}
