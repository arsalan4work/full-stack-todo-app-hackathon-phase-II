---
name: tailwind-design-system-skill
description: Master modern Tailwind CSS design systems with advanced patterns, component architecture, and production-ready styling. Use when building scalable UI with Tailwind, creating design systems, implementing responsive layouts, or crafting pixel-perfect interfaces. Covers utility-first methodology, custom configuration, and enterprise-grade component patterns.
---

# Tailwind Design System Skill

## Instructions

Build production-ready, scalable design systems using Tailwind CSS following modern best practices and patterns:

### 1. **Design System Foundation**

#### Tailwind Configuration Architecture
```javascript
// tailwind.config.ts - Enterprise Setup
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Semantic Color System
      colors: {
        // Brand Colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Semantic Colors
        success: { light: '#10b981', DEFAULT: '#059669', dark: '#047857' },
        warning: { light: '#f59e0b', DEFAULT: '#d97706', dark: '#b45309' },
        error: { light: '#ef4444', DEFAULT: '#dc2626', dark: '#b91c1c' },
        info: { light: '#3b82f6', DEFAULT: '#2563eb', dark: '#1d4ed8' },
      },
      
      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Spacing System (8px base)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border Radius System
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      
      // Shadow System
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'glow': '0 0 20px rgb(59 130 246 / 0.5)',
        'glow-lg': '0 0 40px rgb(59 130 246 / 0.6)',
      },
      
      // Animation System
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-out': 'fadeOut 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
```

### 2. **Component Architecture Patterns**

#### Button Component System
```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-md hover:shadow-lg',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800',
        ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800',
        danger: 'bg-error text-white hover:bg-error-dark shadow-md hover:shadow-lg',
        success: 'bg-success text-white hover:bg-success-dark shadow-md hover:shadow-lg',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button({ 
  className, 
  variant, 
  size, 
  loading, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

#### Card Component System
```tsx
// components/ui/card.tsx
import { cn } from '@/lib/utils'

export function Card({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all',
        'hover:shadow-md dark:border-gray-800 dark:bg-gray-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-4 space-y-1.5', className)}
      {...props}
    />
  )
}

export function CardTitle({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  )
}

export function CardContent({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props} />
  )
}

export function CardFooter({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-6 flex items-center gap-2', className)}
      {...props}
    />
  )
}
```

#### Input Component System
```tsx
// components/ui/input.tsx
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ 
  className, 
  type = 'text',
  label,
  error,
  helperText,
  ...props 
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}

export function Textarea({ 
  className, 
  label,
  error,
  helperText,
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  helperText?: string
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-white',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
}
```

### 3. **Layout Patterns**

#### Container System
```tsx
// components/layout/container.tsx
import { cn } from '@/lib/utils'

export function Container({ 
  className, 
  size = 'default',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
}) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-3xl': size === 'sm',
          'max-w-7xl': size === 'default',
          'max-w-[90rem]': size === 'lg',
          'max-w-[120rem]': size === 'xl',
          'max-w-full': size === 'full',
        },
        className
      )}
      {...props}
    />
  )
}
```

#### Grid Systems
```tsx
// components/layout/grid.tsx
import { cn } from '@/lib/utils'

export function Grid({ 
  className, 
  cols = 3,
  gap = 6,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 2 | 4 | 6 | 8 | 12
}) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': cols === 1,
          'grid-cols-1 md:grid-cols-2': cols === 2,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': cols === 4,
          'grid-cols-1 md:grid-cols-3 lg:grid-cols-5': cols === 5,
          'grid-cols-1 md:grid-cols-3 lg:grid-cols-6': cols === 6,
        },
        {
          'gap-2': gap === 2,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
          'gap-8': gap === 8,
          'gap-12': gap === 12,
        },
        className
      )}
      {...props}
    />
  )
}
```

#### Section Layout
```tsx
// components/layout/section.tsx
import { cn } from '@/lib/utils'

export function Section({ 
  className, 
  padding = 'default',
  ...props 
}: React.HTMLAttributes<HTMLElement> & {
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl'
}) {
  return (
    <section
      className={cn(
        {
          'py-0': padding === 'none',
          'py-8 md:py-12': padding === 'sm',
          'py-12 md:py-16 lg:py-20': padding === 'default',
          'py-16 md:py-24 lg:py-32': padding === 'lg',
          'py-24 md:py-32 lg:py-40': padding === 'xl',
        },
        className
      )}
      {...props}
    />
  )
}
```

### 4. **Advanced UI Patterns**

#### Glassmorphism Effect
```tsx
// components/ui/glass-card.tsx
import { cn } from '@/lib/utils'

export function GlassCard({ 
  className, 
  intensity = 'medium',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  intensity?: 'light' | 'medium' | 'strong'
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-xl',
        {
          'bg-white/10 border-white/20': intensity === 'light',
          'bg-white/20 border-white/30': intensity === 'medium',
          'bg-white/30 border-white/40': intensity === 'strong',
        },
        'dark:bg-black/20 dark:border-white/10',
        className
      )}
      {...props}
    />
  )
}
```

#### Gradient Backgrounds
```tsx
// Gradient utility classes
const gradients = {
  sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600',
  ocean: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600',
  forest: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600',
  fire: 'bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600',
  night: 'bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900',
  mesh: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500',
}

// Animated gradient
export function AnimatedGradient({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
        'bg-[length:200%_200%] animate-[gradient_8s_ease_infinite]',
        className
      )}
      style={{
        backgroundSize: '200% 200%',
        animation: 'gradient 8s ease infinite',
      }}
      {...props}
    />
  )
}
```

#### Loading Skeletons
```tsx
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
      {...props}
    />
  )
}

// Shimmer effect
export function ShimmerSkeleton({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
      {...props}
    />
  )
}
```

### 5. **Responsive Design Patterns**

#### Mobile-First Utilities
```tsx
// Responsive text sizing
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
  Responsive Heading
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Responsive visibility
<div className="block md:hidden">Mobile Only</div>
<div className="hidden md:block">Desktop Only</div>

// Responsive flexbox
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

#### Container Queries (Modern Approach)
```tsx
// components/ui/responsive-card.tsx
export function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container">
      <div className="@sm:grid @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}
```

### 6. **Accessibility Patterns**

#### Focus Management
```tsx
// Focus ring utilities
const focusClasses = {
  default: 'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  error: 'focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2',
  none: 'focus:outline-none',
}

// Screen reader only
export function VisuallyHidden({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip to content link
export function SkipToContent() {
  return (
    
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>
  )
}
```

### 7. **Dark Mode Implementation**

#### Dark Mode Toggle
```tsx
// components/theme-toggle.tsx
'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && 
       window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const newDark = !dark
    setDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDark)
  }

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {dark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  )
}
```

#### Dark Mode Color Strategy
```tsx
// Dark mode utilities
const darkModeColors = {
  background: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
  },
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    tertiary: 'text-gray-500 dark:text-gray-500',
  },
  border: {
    default: 'border-gray-200 dark:border-gray-800',
    strong: 'border-gray-300 dark:border-gray-700',
  },
}
```

### 8. **Animation & Micro-interactions**

#### Hover Effects
```tsx
// Lift on hover
<div className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
  Card content
</div>

// Scale on hover
<button className="transition-transform duration-200 hover:scale-105 active:scale-95">
  Click me
</button>

// Glow on hover
<div className="transition-shadow duration-300 hover:shadow-glow">
  Glowing card
</div>

// Border animation
<div className="relative overflow-hidden before:absolute before:inset-0 before:border-2 before:border-brand-500 before:transition-transform before:duration-300 before:scale-x-0 hover:before:scale-x-100">
  Content
</div>
```

#### Loading States
```tsx
// Pulse animation
<div className="animate-pulse bg-gray-200 rounded-md h-4 w-full" />

// Spin animation
<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-brand-600" />

// Bounce animation
<div className="animate-bounce">↓</div>

// Custom animation
<div className="animate-float">
  Floating element
</div>
```

### 9. **Utility Helper Functions**

#### CN (Class Names) Utility
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Responsive Breakpoint Hook
```typescript
// hooks/use-breakpoint.ts
'use client'

import { useEffect, useState } from 'react'

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
```

### 10. **Production Patterns**

#### Performance Optimization
```tsx
// Lazy load images with blur placeholder
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  className="rounded-lg"
/>

// Reduce motion for accessibility
<div className="motion-reduce:transition-none motion-reduce:transform-none">
  Animated content
</div>

// Optimize font loading
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

## Examples

### Example 1: Modern Dashboard Layout
```tsx
// app/dashboard/page.tsx
import { Container, Section } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Grid } from '@/components/layout/grid'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Section padding="lg">
        <Container>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
Dashboard
</h1>
<p className="mt-2 text-gray-600 dark:text-gray-400">
Welcome back! Here's what's happening today.
</p>
</div>
      {/* Stats Grid */}
      <Grid cols={4} gap={6} className="mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:-translate-y-1 transition-transform">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-success mt-1">+{stat.change}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-brand-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart component */}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Activity list */}
          </CardContent>
        </Card>
      </div>
    </Container>
  </Section>
</div>
)
}

### Example 2: Hero Section with Glassmorphism
```tsx
// components/sections/hero.tsx
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-shift" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 h-64 w-64 bg-white/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 h-96 w-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <GlassCard intensity="medium" className="p-12">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Build the Future
          </h1>
          <p className="text-xl text-white/90 mb-8 animate-slide-in">
            Create stunning web applications with modern design patterns and best practices.
          </p>
          <div className="flex gap-4 justify-center animate-scale-in">
            <Button size="lg" variant="primary" className="bg-white text-gray-900 hover:bg-gray-100">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
```

### Example 3: Form with Advanced Validation
```tsx
// components/forms/contact-form.tsx
'use client'

import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    // Form submission logic
    
    setLoading(false)
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            required
            error={errors.name}
            placeholder="John Doe"
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            required
            error={errors.email}
            placeholder="john@example.com"
          />
          
          <Textarea
            label="Message"
            name="message"
            required
            error={errors.message}
            placeholder="Tell us what you're thinking..."
            rows={5}
          />
          
          <Button type="submit" loading={loading} className="w-full">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Design Checklist

Before completing any Tailwind implementation:

- [ ] **Responsive**: Works on mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- [ ] **Dark Mode**: All components have dark mode variants
- [ ] **Accessibility**: Focus states, ARIA labels, keyboard navigation
- [ ] **Performance**: No unnecessary re-renders, optimized animations
- [ ] **Consistency**: Uses design tokens (colors, spacing, typography)
- [ ] **Hover States**: All interactive elements have hover effects
- [ ] **Loading States**: Loading indicators for async operations
- [ ] **Error States**: Error messages and validation feedback
- [ ] **Empty States**: Helpful messages when no content
- [ ] **Mobile Touch**: Touch targets minimum 44x44px
- [ ] **Contrast**: WCAG AA compliant (4.5:1 for normal text)
- [ ] **Typography**: Proper hierarchy with clear heading levels

## Best Practices Summary

1. **Use Semantic Class Names**: Combine related utilities into reusable components
2. **Mobile-First**: Start with mobile styles, add breakpoints for larger screens
3. **Design Tokens**: Define colors, spacing, typography in config
4. **Component Variants**: Use CVA (class-variance-authority) for complex components
5. **Dark Mode**: Always include dark mode variants
6. **Accessibility**: Focus states, proper contrast, semantic HTML
7. **Performance**: Minimize class count, use @apply sparingly
8. **Consistency**: Reuse components, maintain design system
9. **Animation**: Subtle, purposeful, respects prefers-reduced-motion
10. **Documentation**: Comment complex patterns, create component library