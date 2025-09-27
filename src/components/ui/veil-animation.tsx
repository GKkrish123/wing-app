"use client"

import { DotLottieAnimation } from "./dotlottie-animation"
import { cn } from "@/lib/utils"

// Hosted Veil Animation URL
const VEIL_ANIMATION_URL = "https://lottie.host/42795e73-ebd5-4df1-b8fb-e3daeeba00c9/x0WSzGORTa.lottie"

interface VeilAnimationProps {
  className?: string
  intensity?: "subtle" | "normal" | "prominent"
  position?: "background" | "overlay" | "inline"
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-48 h-48", 
  lg: "w-64 h-64",
  xl: "w-96 h-96",
  full: "w-full h-full"
}

const intensityStyles = {
  subtle: { opacity: 0.3 },
  normal: { opacity: 0.6 },
  prominent: { opacity: 0.8 }
}

export function VeilAnimation({ 
  className, 
  intensity = "normal",
  position = "background",
  size = "lg"
}: VeilAnimationProps) {
  const baseClasses = {
    background: "absolute inset-0 pointer-events-none",
    overlay: "absolute inset-0 pointer-events-none z-10",
    inline: "relative"
  }

  return (
    <div
      id="veil-animation"
      className={cn(
        baseClasses[position],
        position !== "inline" && "flex items-start justify-center",
        className,
        "relative"
      )}
      style={intensityStyles[intensity]}
    >
      <DotLottieAnimation
        src={VEIL_ANIMATION_URL}
        className={cn(
          position === "inline" ? sizeClasses[size] : "max-w-screen-lg max-h-screen-lg",
          "object-contain absolute -translate-y-1/6 -translate-x-3/12"
        )}
        loop={true}
        autoplay={true}
        speed={intensity === "subtle" ? 0.5 : intensity === "prominent" ? 1.2 : 0.8}
      />
    </div>
  )
}
