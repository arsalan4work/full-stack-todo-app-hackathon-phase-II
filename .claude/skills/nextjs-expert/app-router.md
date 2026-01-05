----
name: nextjs-app-router-skill
description: App Router is Next.js's routing system based on the file system. Files and folders in the `app/` directory automatically become routes in your application.
----

## Core Concepts

### File-System Routing
The folder structure in `app/` directly maps to URL paths:
```
app/
├── page.tsx                    → /
├── about/
│   └── page.tsx               → /about
├── blog/
│   ├── page.tsx               → /blog
│   └── [slug]/
│       └── page.tsx           → /blog/:slug
└── dashboard/
    ├── page.tsx               → /dashboard
    ├── settings/
    │   └── page.tsx           → /dashboard/settings
    └── [id]/
        └── page.tsx           → /dashboard/:id
```

### Special Files

| File | Purpose | Required |
|------|---------|----------|
| `layout.tsx` | Shared UI wrapper for routes | Root only |
| `page.tsx` | Route UI (makes route accessible) | Yes for each route |
| `loading.tsx` | Loading UI during data fetch | No |
| `error.tsx` | Error boundary UI | No |
| `not-found.tsx` | 404 UI | No |
| `route.ts` | API endpoint | No |
| `template.tsx` | Re-rendered layout | No |
| `default.tsx` | Parallel route fallback | No |

## Basic Routing

### Creating a Simple Page
```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our about page</p>
    </div>
  )
}
```

**URL**: `http://localhost:3000/about`

### Creating Nested Routes
```typescript
// app/blog/posts/page.tsx
export default function PostsPage() {
  return (
    <div>
      <h1>All Posts</h1>
    </div>
  )
}
```

**URL**: `http://localhost:3000/blog/posts`

### Root Layout (Required)

Every app must have a root layout at `app/layout.tsx`:
```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My App',
  description: 'My application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>{/* Global navigation */}</nav>
        </header>
        <main>{children}</main>
        <footer>{/* Global footer */}</footer>
      </body>
    </html>
  )
}
```

## Layouts

### What are Layouts?
Layouts wrap pages and persist across route changes. They don't re-render when navigating between routes.

### Nested Layouts
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>
        {/* Dashboard sidebar */}
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/settings">Settings</a>
          <a href="/dashboard/profile">Profile</a>
        </nav>
      </aside>
      <div className="content">
        {children}
      </div>
    </div>
  )
}
```
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard Overview</h1>
}
```

**Result**: Dashboard sidebar persists when navigating between dashboard pages.

### Layout Hierarchy

Layouts nest automatically:
```
app/
├── layout.tsx              (Root - wraps everything)
└── dashboard/
    ├── layout.tsx          (Dashboard - wraps dashboard routes)
    └── settings/
        ├── layout.tsx      (Settings - wraps settings routes)
        └── page.tsx        (Settings page)
```

**Rendering Order**:
1. Root Layout wraps →
2. Dashboard Layout wraps →
3. Settings Layout wraps →
4. Settings Page

## Dynamic Routes

### Single Dynamic Segment
```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  return (
    <article>
      <h1>Post: {params.slug}</h1>
    </article>
  )
}
```

**URLs**:
- `/blog/hello-world` → `params.slug = "hello-world"`
- `/blog/nextjs-guide` → `params.slug = "nextjs-guide"`

### Multiple Dynamic Segments
```typescript
// app/shop/[category]/[product]/page.tsx
export default function ProductPage({
  params,
}: {
  params: { category: string; product: string }
}) {
  return (
    <div>
      <h1>{params.category}</h1>
      <h2>{params.product}</h2>
    </div>
  )
}
```

**URL**: `/shop/electronics/laptop` 
- `params.category = "electronics"`
- `params.product = "laptop"`

### Catch-All Segments

Catch all subsequent segments:
```typescript
// app/docs/[...slug]/page.tsx
export default function DocsPage({
  params,
}: {
  params: { slug: string[] }
}) {
  return (
    <div>
      <h1>Docs</h1>
      <p>Path: {params.slug.join('/')}</p>
    </div>
  )
}
```

**URLs**:
- `/docs/intro` → `params.slug = ["intro"]`
- `/docs/api/auth` → `params.slug = ["api", "auth"]`
- `/docs/guides/getting-started/setup` → `params.slug = ["guides", "getting-started", "setup"]`

### Optional Catch-All Segments

Make catch-all optional by wrapping in double brackets:
```typescript
// app/shop/[[...slug]]/page.tsx
export default function ShopPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  return (
    <div>
      {params.slug ? (
        <p>Category: {params.slug.join('/')}</p>
      ) : (
        <p>All Products</p>
      )}
    </div>
  )
}
```

**URLs**:
- `/shop` → `params.slug = undefined`
- `/shop/electronics` → `params.slug = ["electronics"]`
- `/shop/electronics/laptops` → `params.slug = ["electronics", "laptops"]`

## Route Groups

Organize routes without affecting URL structure using parentheses:
```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx       → /about (not /marketing/about)
│   └── contact/
│       └── page.tsx       → /contact
├── (shop)/
│   ├── products/
│   │   └── page.tsx       → /products
│   └── cart/
│       └── page.tsx       → /cart
└── page.tsx               → /
```

**Benefits**:
- Organize code by feature
- Apply different layouts to route groups
- No impact on URLs

### Route Group with Layout
```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <nav>{/* Marketing nav */}</nav>
      {children}
    </div>
  )
}
```
```typescript
// app/(shop)/layout.tsx
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="shop-layout">
      <nav>{/* Shop nav */}</nav>
      {children}
    </div>
  )
}
```

## Navigation

### Link Component

Use `next/link` for client-side navigation:
```typescript
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
      
      {/* Dynamic route */}
      <Link href="/blog/my-first-post">My First Post</Link>
      
      {/* With query params */}
      <Link href="/search?q=nextjs">Search</Link>
      
      {/* External link (opens in new tab) */}
      <Link href="https://nextjs.org" target="_blank" rel="noopener">
        Next.js Docs
      </Link>
    </nav>
  )
}
```

### Programmatic Navigation

Use `useRouter` hook for navigation in Client Components:
```typescript
'use client'

import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Perform login
    const success = await login()
    
    if (success) {
      // Navigate to dashboard
      router.push('/dashboard')
      
      // Or replace current history entry
      // router.replace('/dashboard')
      
      // Or go back
      // router.back()
      
      // Or refresh current route
      // router.refresh()
    }
  }
  
  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>
}
```

### useRouter Methods
```typescript
'use client'

import { useRouter } from 'next/navigation'

const router = useRouter()

// Navigate to route
router.push('/dashboard')

// Replace current route (no back button history)
router.replace('/login')

// Go back in history
router.back()

// Go forward in history
router.forward()

// Refresh current route data
router.refresh()

// Prefetch route for faster navigation
router.prefetch('/profile')
```

### Prefetching

Next.js automatically prefetches linked routes when they enter viewport:
```typescript
// Automatic prefetching (default)
<Link href="/about">About</Link>

// Disable prefetching
<Link href="/about" prefetch={false}>About</Link>

// Manual prefetching
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.prefetch('/dashboard')
```

## Active Links

### Checking Active Route
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav>
      <Link 
        href="/" 
        className={pathname === '/' ? 'active' : ''}
      >
        Home
      </Link>
      
      <Link 
        href="/about" 
        className={pathname === '/about' ? 'active' : ''}
      >
        About
      </Link>
      
      <Link 
        href="/blog" 
        className={pathname.startsWith('/blog') ? 'active' : ''}
      >
        Blog
      </Link>
    </nav>
  )
}
```

## Loading States

### loading.tsx

Automatically shows loading UI while page loads:
```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  )
}
```
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Suspends while fetching
  const data = await fetchData()
  
  return <div>{/* Render data */}</div>
}
```

**Result**: Shows `loading.tsx` UI while `page.tsx` fetches data.

### Streaming with Suspense

Fine-grained loading states:
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
      
      <Suspense fallback={<div>Loading activity...</div>}>
        <Activity />
      </Suspense>
    </div>
  )
}

async function Stats() {
  const stats = await fetchStats()
  return <div>{/* Render stats */}</div>
}

async function Activity() {
  const activity = await fetchActivity()
  return <div>{/* Render activity */}</div>
}
```

## Error Handling

### error.tsx

Catches errors in route segment:
```typescript
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### not-found.tsx

Custom 404 page:
```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Could not find the requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  )
}
```

Trigger programmatically:
```typescript
// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await fetchPost(params.id)
  
  if (!post) {
    notFound() // Shows not-found.tsx
  }
  
  return <article>{/* Render post */}</article>
}
```

## Metadata

### Static Metadata
```typescript
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  keywords: ['about', 'company', 'team'],
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
    images: ['/og-about.jpg'],
  },
}

export default function AboutPage() {
  return <div>About content</div>
}
```

### Dynamic Metadata
```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const post = await fetchPost(params.slug)
  return <article>{/* Render post */}</article>
}
```

### Metadata Template

Set title template in layout:
```typescript
// app/layout.tsx
export const metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
}
```
```typescript
// app/about/page.tsx
export const metadata = {
  title: 'About', // Becomes "About | My App"
}
```

## Route Handlers (API Routes)

### Basic API Route
```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
```

**URL**: `GET /api/hello`

### Multiple HTTP Methods
```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await fetchUsers()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const body = await request.json()
  const user = await createUser(body)
  return NextResponse.json(user, { status: 201 })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const user = await updateUser(body)
  return NextResponse.json(user)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await deleteUser(id)
  return NextResponse.json({ success: true })
}
```

### Dynamic Route Handler
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await fetchUser(params.id)
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  return NextResponse.json(user)
}
```

**URL**: `GET /api/users/123`

## Redirects

### Permanent Redirect
```typescript
// app/old-page/page.tsx
import { redirect } from 'next/navigation'

export default function OldPage() {
  redirect('/new-page')
}
```

### Conditional Redirect
```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>Dashboard content</div>
}
```

### Redirect in next.config.ts
```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/docs',
        destination: '/docs/introduction',
        permanent: false,
      },
    ]
  },
}
```

## Route Parameters & Search Params

### URL Search Params
```typescript
// app/search/page.tsx
export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string }
}) {
  return (
    <div>
      <h1>Search Results</h1>
      <p>Query: {searchParams.q}</p>
      <p>Category: {searchParams.category}</p>
    </div>
  )
}
```

**URL**: `/search?q=nextjs&category=tutorials`
- `searchParams.q = "nextjs"`
- `searchParams.category = "tutorials"`

### Reading Search Params in Client Components
```typescript
'use client'

import { useSearchParams } from 'next/navigation'

export default function SearchForm() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  
  return (
    <div>
      <p>Current query: {query}</p>
      <p>Current category: {category}</p>
    </div>
  )
}
```

## Parallel Routes

Multiple pages in the same layout:
```
app/
├── layout.tsx
├── @analytics/
│   └── page.tsx
├── @feed/
│   └── page.tsx
└── page.tsx
```
```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  feed,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  feed: React.ReactNode
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2">
        {analytics}
        {feed}
      </div>
    </div>
  )
}
```

## Intercepting Routes

Show modal over current page:
```
app/
├── photos/
│   ├── page.tsx              → /photos
│   └── [id]/
│       └── page.tsx          → /photos/123
└── @modal/
    └── (.)photos/
        └── [id]/
            └── page.tsx      → Intercepts /photos/123
```

**Patterns**:
- `(.)` - Same level
- `(..)` - One level up
- `(..)(..)` - Two levels up
- `(...)` - From root

## Best Practices

### ✅ DO:
- Use Server Components by default for pages
- Organize routes logically with route groups
- Add loading.tsx for better UX
- Add error.tsx for error boundaries
- Use dynamic routes for variable content
- Implement metadata for SEO
- Use Link component for navigation
- Prefetch important routes
- Keep layouts simple and focused

### ❌ DON'T:
- Create unnecessary nesting
- Fetch data in Client Components
- Skip loading and error states
- Use anchor tags for internal navigation
- Over-complicate route structure
- Forget to handle 404 cases
- Ignore metadata optimization

## Common Patterns

### Pattern 1: Protected Route
```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>{children}</div>
}
```

### Pattern 2: Breadcrumbs
```typescript
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  
  return (
    <nav>
      <Link href="/">Home</Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`
        return (
          <span key={path}>
            {' / '}
            <Link href={path}>{segment}</Link>
          </span>
        )
      })}
    </nav>
  )
}
```

### Pattern 3: Tab Navigation
```typescript
// app/profile/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const tabs = [
    { href: '/profile', label: 'Overview' },
    { href: '/profile/settings', label: 'Settings' },
    { href: '/profile/security', label: 'Security' },
  ]
  
  return (
    <div>
      <nav className="tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={pathname === tab.href ? 'active' : ''}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  )
}
```

## Summary

App Router provides:
- 📁 File-system based routing
- 🎨 Nested layouts that persist
- 🔄 Dynamic routes with params
- 📍 Active link detection
- ⚡ Automatic code splitting
- 🔀 Parallel and intercepting routes
- 🎯 Built-in error and loading states
- 🔍 SEO-friendly metadata API
- 🚀 Automatic prefetching

Master these concepts and you'll build fast, scalable Next.js applications with excellent UX.