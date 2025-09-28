"use client"

import * as React from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface HoverEffectProps {
  children: React.ReactNode
  className?: string
  effect?: "lift" | "glow" | "scale" | "rotate" | "bounce"
  intensity?: "subtle" | "medium" | "strong"
}

export function HoverEffect({ 
  children, 
  className, 
  effect = "lift", 
  intensity = "medium" 
}: HoverEffectProps) {
  const effects = {
    lift: {
      subtle: { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
      medium: { y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
      strong: { y: -8, boxShadow: "0 16px 40px rgba(0,0,0,0.2)" }
    },
    glow: {
      subtle: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
      medium: { boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" },
      strong: { boxShadow: "0 0 40px rgba(59, 130, 246, 0.7)" }
    },
    scale: {
      subtle: { scale: 1.02 },
      medium: { scale: 1.05 },
      strong: { scale: 1.1 }
    },
    rotate: {
      subtle: { rotate: 2 },
      medium: { rotate: 5 },
      strong: { rotate: 10 }
    },
    bounce: {
      subtle: { y: [0, -2, 0] },
      medium: { y: [0, -4, 0] },
      strong: { y: [0, -8, 0] }
    }
  }

  return (
    <motion.div
      className={className}
      whileHover={effects[effect][intensity]}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )
}

interface CounterProps {
  from: number
  to: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ from, to, duration = 2, className }: CounterProps) {
  const [count, setCount] = React.useState(from)
  const controls = useAnimation()
  const ref = React.useRef(null)
  const inView = useInView(ref)

  React.useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
      })

      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev >= to) {
            clearInterval(timer)
            return to
          }
          return prev + Math.ceil((to - from) / (duration * 10))
        })
      }, 100)

      return () => clearInterval(timer)
    }
  }, [inView, controls, from, to, duration])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
    >
      {count.toLocaleString()}
    </motion.span>
  )
}

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function AnimatedProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-primary"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatedCounter from={0} to={progress} duration={1} className="text-2xl font-bold" />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
    </div>
  )
}

interface FloatingActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function FloatingActionButton({ 
  children, 
  onClick, 
  className,
  position = "bottom-right" 
}: FloatingActionButtonProps) {
  const positions = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  }

  return (
    <motion.button
      className={cn(
        "fixed z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center",
        positions[position],
        className
      )}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}

interface PulseEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
  intensity?: "low" | "medium" | "high"
}

export function PulseEffect({ 
  children, 
  className, 
  color = "primary", 
  intensity = "medium" 
}: PulseEffectProps) {
  const intensityMap = {
    low: { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] },
    medium: { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] },
    high: { scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }
  }

  return (
    <motion.div
      className={cn("relative", className)}
      animate={intensityMap[intensity]}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface MagneticEffectProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function MagneticEffect({ children, className, strength = 0.3 }: MagneticEffectProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const ref = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}
