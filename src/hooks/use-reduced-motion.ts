"use client"

import { useState, useEffect } from "react"

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

export function useAccessibleAnimation() {
  const prefersReducedMotion = useReducedMotion()
  
  return {
    prefersReducedMotion,
    // Provide safe animation defaults
    duration: prefersReducedMotion ? 0 : undefined,
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : { type: "spring", stiffness: 400, damping: 17 },
    animate: prefersReducedMotion ? false : undefined,
  }
}
