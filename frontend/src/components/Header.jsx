'use client'
import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Placeholder del mismo tamaño para evitar layout shift durante SSR
  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.98]"
    >
      {isDark
        ? <Sun  className="w-5 h-5" strokeWidth={1.75} />
        : <Moon className="w-5 h-5" strokeWidth={1.75} />
      }
    </button>
  )
}

const Header = () => {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Uchrono Logo" className="w-10 h-10 rounded-xl object-contain bg-card" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Uchrono</h1>
              <p className="text-sm text-muted-foreground">What could have been, what you can learn</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-gain rounded-full" />
                <span>Educational Tool</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span>Mock Data</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
