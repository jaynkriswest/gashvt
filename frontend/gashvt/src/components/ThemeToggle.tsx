"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

// Change 'export default function ThemeToggle' to 'export function ModeToggle'
export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-brand-panel border border-brand-border hover:border-blue-500/50 transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-amber-500 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 text-blue-400 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
      <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}