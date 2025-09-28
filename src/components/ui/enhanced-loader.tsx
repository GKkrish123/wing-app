"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EnhancedLoaderProps {
  variant?: "spinner" | "dots" | "pulse" | "wave" | "skeleton"
  size?: "sm" | "md" | "lg"
  className?: string
}

const LoadingSpinner = ({ size, className }: { size: string, className?: string }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }

  return (
    <motion.div
      className={cn(
        "rounded-full border-2 border-primary/30 border-t-primary",
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

const LoadingDots = ({ size, className }: { size: string, className?: string }) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "bg-primary rounded-full",
            sizeClasses[size as keyof typeof sizeClasses]
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

const LoadingPulse = ({ size, className }: { size: string, className?: string }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  }

  return (
    <motion.div
      className={cn(
        "bg-primary/20 rounded-full relative",
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className="absolute inset-2 bg-primary/40 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      >
        <motion.div
          className="absolute inset-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
        />
      </motion.div>
    </motion.div>
  )
}

const LoadingWave = ({ size, className }: { size: string, className?: string }) => {
  const heightClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16"
  }

  const barWidthClasses = {
    sm: "w-1",
    md: "w-1.5",
    lg: "w-2"
  }

  return (
    <div className={cn("flex items-end space-x-1", className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "bg-primary rounded-t",
            barWidthClasses[size as keyof typeof barWidthClasses]
          )}
          animate={{
            height: ["20%", "100%", "20%"]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
          style={{
            minHeight: size === "sm" ? "4px" : size === "md" ? "6px" : "8px"
          }}
        />
      ))}
    </div>
  )
}

const LoadingSkeleton = ({ size, className }: { size: string, className?: string }) => {
  const heightClasses = {
    sm: "h-20",
    md: "h-32",
    lg: "h-40"
  }

  return (
    <div className={cn("space-y-3", heightClasses[size as keyof typeof heightClasses], className)}>
      <motion.div
        className="h-4 bg-muted rounded skeleton"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="h-4 bg-muted rounded skeleton w-4/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      <motion.div
        className="h-4 bg-muted rounded skeleton w-3/5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />
    </div>
  )
}

export function EnhancedLoader({ 
  variant = "spinner", 
  size = "md", 
  className 
}: EnhancedLoaderProps) {
  const variants = {
    spinner: <LoadingSpinner size={size} className={className} />,
    dots: <LoadingDots size={size} className={className} />,
    pulse: <LoadingPulse size={size} className={className} />,
    wave: <LoadingWave size={size} className={className} />,
    skeleton: <LoadingSkeleton size={size} className={className} />
  }

  return (
    <div className="flex items-center justify-center p-4">
      {variants[variant]}
    </div>
  )
}

// Page loader component
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <EnhancedLoader variant="pulse" size="lg" />
        <motion.p
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading your Wing experience...
        </motion.p>
      </motion.div>
    </div>
  )
}
