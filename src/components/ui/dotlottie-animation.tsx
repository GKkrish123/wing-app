"use client"

import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { cn } from "@/lib/utils"

interface DotLottieAnimationProps {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
}

export function DotLottieAnimation({
  src,
  className,
  loop = true,
  autoplay = true,
  speed = 1,
  width,
  height,
  style,
}: DotLottieAnimationProps) {
  return (
    <div 
      className={cn("", className)} 
      style={{ width, height, ...style }}
    >
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={{
          width: "100%",
          height: "100%",
          ...style,
        }}
      />
    </div>
  )
}
