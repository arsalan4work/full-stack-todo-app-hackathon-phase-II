---
name: modern-ui-standards-skill
description: Create contemporary, visually striking user interfaces following 2025 design trends. Use when building modern web applications, dashboards, landing pages, or any UI that should feel current and professional. Covers glassmorphism, dark mode, animations, typography, spacing, and accessibility standards.
---

# Modern UI Standards Skill

## Instructions

Build user interfaces that follow contemporary design standards and trends for 2025:

### 1. **Design System Fundamentals**
- **Color Palettes**: Use modern color systems with semantic naming
  - Primary, secondary, accent colors
  - Neutral grays (50-950 scale)
  - Success, warning, error, info states
  - Dark mode variants for all colors
- **Typography Scale**: Implement harmonious type scale
  - Use system fonts or premium web fonts
  - Scale: xs (0.75rem) → sm (0.875rem) → base (1rem) → lg (1.125rem) → xl-9xl
  - Line heights: tight (1.25) → normal (1.5) → relaxed (1.75)
  - Font weights: 300, 400, 500, 600, 700, 800
- **Spacing System**: Consistent spacing scale
  - Base unit: 0.25rem (4px)
  - Scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64
  - Use for padding, margin, gaps

### 2. **Modern Visual Effects**
- **Glassmorphism**
```css
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
```
- **Neumorphism** (use sparingly)
```css
  background: #e0e0e0;
  box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
```
- **Gradients**
  - Subtle background gradients
  - Gradient text effects
  - Gradient borders
  - Mesh gradients for backgrounds
- **Shadows**
  - Layered shadows for depth
  - Colored shadows matching elements
  - Elevation system (sm, md, lg, xl, 2xl)

### 3. **Animation & Interactions**
- **Micro-interactions**
  - Button hover effects (scale, color shift, shadow)
  - Input focus states with smooth transitions
  - Loading skeletons instead of spinners
  - Toast notifications with slide-in animations
- **Page Transitions**
  - Fade in on mount
  - Stagger children animations
  - Scroll-triggered animations
- **Performance**
  - Use CSS transforms (not position changes)
  - Prefer opacity and transform for animations
  - Use `will-change` sparingly
  - Keep animations under 300ms for snappy feel

### 4. **Component Design Patterns**
- **Cards**
  - Rounded corners (radius: 8px, 12px, 16px)
  - Subtle borders or shadows
  - Hover effects (lift, glow, border highlight)
  - Proper padding (16px-24px)
- **Buttons**
  - Primary: Filled with solid color
  - Secondary: Outlined or ghost
  - Sizes: sm, md, lg with consistent padding
  - States: default, hover, active, disabled, loading
  - Icons with proper spacing
- **Forms**
  - Clear labels above or floating
  - Visible focus states
  - Inline validation with icons
  - Helper text below inputs
  - Error states with color and message
- **Navigation**
  - Sticky headers with blur backdrop
  - Mobile-first hamburger menus
  - Active state indication
  - Smooth transitions between pages

### 5. **Dark Mode Implementation**
- **Color Strategy**
  - Pure black (#000) is harsh; use dark grays (#0a0a0a, #121212)
  - Reduce contrast slightly for comfort
  - Use colored shadows in dark mode
  - Invert shadows (light shadows on dark bg)
- **Implementation**
```css
  /* Tailwind dark mode */
  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  
  /* CSS variables */
  :root { --bg: #fff; --text: #000; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0a0a0a; --text: #fff; }
  }
```
- **Toggle Component**
  - Sun/moon icons
  - Smooth transition between modes
  - Persist user preference (localStorage)

### 6. **Responsive Design**
- **Mobile First**
  - Design for mobile screens first
  - Progressive enhancement for larger screens
  - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Fluid Typography**
```css
  font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
```
- **Container Queries** (when supported)
  - Style based on parent container size
  - Better than media queries for components
- **Touch Targets**
  - Minimum 44x44px for interactive elements
  - Adequate spacing between clickable items

### 7. **Accessibility Standards**
- **Contrast Ratios**
  - Normal text: 4.5:1 minimum
  - Large text (18px+): 3:1 minimum
  - Interactive elements: 3:1 minimum
- **Keyboard Navigation**
  - Visible focus indicators
  - Logical tab order
  - Skip to main content link
- **Semantic HTML**
  - Use proper heading hierarchy (h1-h6)
  - ARIA labels when needed
  - Alt text for images
  - Button vs link distinction
- **Screen Reader Support**
  - ARIA live regions for dynamic content
  - Descriptive link text
  - Form labels associated with inputs

### 8. **Performance Patterns**
- **Image Optimization**
  - Use next/image or modern formats (WebP, AVIF)
  - Lazy loading for below-fold images
  - Responsive images with srcset
  - Proper sizing to avoid layout shift
- **Code Splitting**
  - Dynamic imports for heavy components
  - Route-based splitting
  - Lazy load modals and drawers
- **Loading States**
  - Skeleton screens for content
  - Progress indicators for actions
  - Optimistic UI updates

### 9. **Layout Patterns**
- **Grid Systems**
  - CSS Grid for 2D layouts
  - Flexbox for 1D layouts
  - Avoid float-based layouts
- **Spacing & Rhythm**
  - Consistent vertical rhythm
  - Generous whitespace (don't cram)
  - Section separation with spacing
- **Max Widths**
  - Content max width: 1280px-1440px
  - Text max width: 65ch for readability
  - Full-width for hero sections

### 10. **Modern Typography**
- **Font Pairing**
  - Serif for headings + sans-serif for body
  - Or single font family with varied weights
- **Readability**
  - Line length: 45-75 characters
  - Line height: 1.5-1.75 for body text
  - Adequate letter spacing for uppercase
- **Hierarchy**
  - Clear size distinction between levels
  - Use weight and color for emphasis
  - Limit to 2-3 font sizes per section

## Examples

### Modern Card Component
```tsx
// React + Tailwind
export function ModernCard({ title, description, image }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 
                    border border-gray-200 dark:border-gray-800
                    hover:shadow-xl hover:shadow-blue-500/10 
                    transition-all duration-300 hover:-translate-y-1">
      {/* Image with gradient overlay */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 
                     group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white 
                       group-hover:text-blue-600 dark:group-hover:text-blue-400 
                       transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Glassmorphism accent */}
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full
                      bg-white/10 dark:bg-black/10 backdrop-blur-sm
                      border border-white/20 dark:border-white/10
                      text-xs font-medium text-white">
        Featured
      </div>
    </div>
  )
}
```

### Glassmorphism Navigation
```tsx
export function GlassNav() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                    px-6 py-3 rounded-full
                    bg-white/10 dark:bg-black/10
                    backdrop-blur-xl
                    border border-white/20 dark:border-white/10
                    shadow-lg shadow-black/5">
      <div className="flex items-center gap-8">
        <a href="/" className="font-semibold text-gray-900 dark:text-white">
          Logo
        </a>
        <div className="flex gap-6">
          {['Home', 'About', 'Contact'].map((item) => (
            <a 
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300
                         hover:text-gray-900 dark:hover:text-white
                         transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 
                             bg-blue-600 dark:bg-blue-400
                             group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

### Modern Button Variants
```tsx
export function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white',
    outline: 'border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-medium
        transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Dark Mode Toggle
```tsx
'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
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
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 
                 hover:bg-gray-300 dark:hover:bg-gray-700
                 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
```

### Animated Loading Skeleton
```tsx
export function Skeleton({ className = '' }) {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
                  dark:from-gray-800 dark:via-gray-700 dark:to-gray-800
                  bg-[length:200%_100%]
                  ${className}`}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
      }}
    />
  )
}

// Add to global CSS
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Design Checklist

Before completing a UI component, verify:

- [ ] Works in both light and dark mode
- [ ] Responsive across mobile, tablet, desktop
- [ ] Has hover, focus, active, disabled states
- [ ] Meets WCAG AA contrast requirements
- [ ] Has smooth transitions (200-300ms)
- [ ] Uses consistent spacing from design system
- [ ] Includes loading and error states
- [ ] Has proper keyboard navigation
- [ ] Uses semantic HTML elements
- [ ] Optimized images (WebP, lazy loading)
- [ ] No layout shift on load
- [ ] Touch-friendly on mobile (44px+ targets)