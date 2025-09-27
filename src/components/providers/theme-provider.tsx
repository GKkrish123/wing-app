"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  setTheme: (value: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = theme === "dark" || (theme === "system" && isSystemDark)
  root.classList.toggle("dark", isDark)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("theme") as Theme | null) : null
    if (stored) {
      setThemeState(stored)
      applyThemeToDocument(stored)
    } else {
      applyThemeToDocument("system")
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => {
      const current = (localStorage.getItem("theme") as Theme | null) ?? "system"
      applyThemeToDocument(current)
    }
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value)
    localStorage.setItem("theme", value)
    applyThemeToDocument(value)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}


