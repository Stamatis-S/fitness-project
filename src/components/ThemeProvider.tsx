
import React, { createContext, useContext } from "react"

type Theme = "brand"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "brand",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "brand",
  ...props
}: ThemeProviderProps) {
  // Apply theme immediately without hooks to avoid bundling issues
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add("brand")
  }

  const value = {
    theme: "brand" as Theme,
    setTheme: () => {},
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
