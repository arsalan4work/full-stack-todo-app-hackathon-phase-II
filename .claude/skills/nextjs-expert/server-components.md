----
name: nextjs-server-components-skill
description: Server Components are React components that render on the server and send only the resulting HTML to the client. They are the **default** in Next.js 16 App Router.
----

### Key Benefits
- 🚀 **Faster Initial Load** - Less JavaScript sent to browser
- 🔒 **Secure** - Keep sensitive data and logic on server
- 💾 **Direct Data Access** - Query databases directly
- 📦 **Smaller Bundle** - Reduce client-side JavaScript
- 🔍 **SEO-Friendly** - Fully rendered HTML for crawlers

## Server vs Client Components

### Component Types Comparison

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| **Default in App Router** | ✅ Yes | ❌ No (needs 'use client') |
| **Runs on** | Server only | Server + Client |
| **Can use hooks** | ❌ No | ✅ Yes |
| **Can access server resources** | ✅ Yes (DB, filesystem) | ❌ No |
| **Can use browser APIs** | ❌ No | ✅ Yes (window, localStorage) |
| **Can add event listeners** | ❌ No | ✅ Yes (onClick, onChange) |
| **Can use state** | ❌ No | ✅ Yes (useState, useReducer) |
| **Can use effects** | ❌ No | ✅ Yes (useEffect, useLayoutEffect) |
| **Bundle size impact** | ✅ Zero (not sent to client) | ❌ Adds to bundle |
| **Re-renders** | ❌ No (regenerates on server) | ✅ Yes |

## Server Components (Default)

### Basic Server Component
```typescript
// app/posts/page.tsx
// This is a Server Component by default (no 'use client')

export default async function PostsPage() {
  // Direct database access
  const posts = await db.query('SELECT * FROM posts')
  
  return (
    <div>
      <h1>All Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}
```

### Server Component with async/await
```typescript
// app/users/[id]/page.tsx
async function fetchUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

async function fetchUserPosts(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}/posts`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export default async function UserPage({
  params,
}: {
  params: { id: string }
}) {
  // Parallel data fetching
  const [user, posts] = await Promise.all([
    fetchUser(params.id),
    fetchUserPosts(params.id),
  ])
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      
      <h2>Posts by {user.name}</h2>
      {posts.map((post: any) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Server Component Capabilities
```typescript
// app/dashboard/page.tsx
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/database'
import { readFile } from 'fs/promises'

export default async function DashboardPage() {
  // ✅ Access cookies
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  
  // ✅ Access headers
  const headersList = headers()
  const userAgent = headersList.get('user-agent')
  
  // ✅ Direct database access
  const users = await db.select().from('users')
  
  // ✅ Read files from filesystem
  const config = await readFile('./config.json', 'utf-8')
  
  // ✅ Use environment variables (server-side only)
  const apiKey = process.env.API_SECRET_KEY
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Users: {users.length}</p>
    </div>
  )
}
```

### What Server Components CANNOT Do
```typescript
// ❌ WRONG - Server Components cannot use hooks
export default async function WrongComponent() {
  const [count, setCount] = useState(0) // ERROR!
  
  useEffect(() => {
    console.log('mounted')
  }, []) // ERROR!
  
  return <div>{count}</div>
}

// ❌ WRONG - Server Components cannot use event handlers
export default async function WrongComponent() {
  return (
    <button onClick={() => alert('clicked')}> {/* ERROR! */}
      Click me
    </button>
  )
}

// ❌ WRONG - Server Components cannot use browser APIs
export default async function WrongComponent() {
  const width = window.innerWidth // ERROR!
  localStorage.setItem('key', 'value') // ERROR!
  
  return <div>Width: {width}</div>
}
```

## Client Components

### Creating a Client Component

Add `'use client'` directive at the top of the file:
```typescript
// components/Counter.tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### Client Component with Effects
```typescript
// components/Analytics.tsx
'use client'

import { useEffect } from 'react'

export default function Analytics() {
  useEffect(() => {
    // Track page view
    console.log('Page viewed')
    
    // Access browser APIs
    const width = window.innerWidth
    console.log('Screen width:', width)
    
    // Cleanup
    return () => {
      console.log('Component unmounted')
    }
  }, [])
  
  return null // No UI, just side effects
}
```

### Client Component with Browser APIs
```typescript
// components/ThemeToggle.tsx
'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    // Read from localStorage
    const saved = localStorage.getItem('theme') as 'light' | 'dark'
    if (saved) setTheme(saved)
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
    
    // Update document
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

### When to Use Client Components

Use `'use client'` when you need:

1. **Interactivity** - onClick, onChange, onSubmit
2. **State** - useState, useReducer
3. **Effects** - useEffect, useLayoutEffect
4. **Browser APIs** - window, document, localStorage, sessionStorage
5. **Custom Hooks** - Any hook that uses state/effects
6. **Event Listeners** - addEventListener, keyboard events
7. **React Context** - useContext (at consumption level)
8. **Third-party libraries** - Libraries that use hooks/browser APIs
```typescript
// ✅ CORRECT - Use Client Component for interactivity
'use client'

import { useState } from 'react'

export default function SearchForm() {
  const [query, setQuery] = useState('')
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      console.log('Search for:', query)
    }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  )
}
```

## Component Composition Patterns

### Pattern 1: Server Component with Client Component Children
```typescript
// app/page.tsx (Server Component)
import Counter from '@/components/Counter' // Client Component
import Analytics from '@/components/Analytics' // Client Component

export default async function HomePage() {
  const data = await fetchData() // Server-side data fetching
  
  return (
    <div>
      <h1>Welcome</h1>
      <p>Data: {data.message}</p>
      
      {/* Client Components for interactivity */}
      <Counter />
      <Analytics />
    </div>
  )
}
```

### Pattern 2: Passing Server Components as Props to Client Components
```typescript
// components/ClientWrapper.tsx (Client Component)
'use client'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="interactive-wrapper">
      {children}
    </div>
  )
}
```
```typescript
// app/page.tsx (Server Component)
import ClientWrapper from '@/components/ClientWrapper'

async function ServerContent() {
  const data = await fetchData()
  return <div>{data.content}</div>
}

export default function HomePage() {
  return (
    <ClientWrapper>
      {/* Server Component passed as children */}
      <ServerContent />
    </ClientWrapper>
  )
}
```

### Pattern 3: Splitting Components for Optimization
```typescript
// ❌ BAD - Entire component is Client Component
'use client'

import { useState } from 'react'

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1)
  
  return (
    <div>
      <h1>Product Details</h1>
      {/* Lots of static content */}
      <p>Description...</p>
      <img src="/product.jpg" alt="Product" />
      
      {/* Only this needs interactivity */}
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
    </div>
  )
}
```
```typescript
// ✅ GOOD - Split into Server and Client Components

// components/QuantitySelector.tsx (Client Component)
'use client'

import { useState } from 'react'

export default function QuantitySelector() {
  const [quantity, setQuantity] = useState(1)
  
  return (
    <input
      type="number"
      value={quantity}
      onChange={(e) => setQuantity(Number(e.target.value))}
    />
  )
}
```
```typescript
// app/products/[id]/page.tsx (Server Component)
import QuantitySelector from '@/components/QuantitySelector'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await fetchProduct(params.id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} alt={product.name} />
      
      {/* Only interactive part is Client Component */}
      <QuantitySelector />
    </div>
  )
}
```

## Data Fetching Patterns

### Server Component Data Fetching
```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // Optional: Revalidate every 60 seconds
    next: { revalidate: 60 },
  })
  
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div>
      {posts.map((post: any) => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  )
}
```

### Client Component Data Fetching (SWR)
```typescript
// components/UserProfile.tsx
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  )
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading user</div>
  
  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  )
}
```

### Client Component Data Fetching (useEffect)
```typescript
// components/Comments.tsx
'use client'

import { useState, useEffect } from 'react'

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data)
        setLoading(false)
      })
  }, [postId])
  
  if (loading) return <div>Loading comments...</div>
  
  return (
    <div>
      {comments.map((comment: any) => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  )
}
```

## Context and Providers

### Creating a Provider (Client Component)
```typescript
// providers/ThemeProvider.tsx
'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### Using Provider in Root Layout
```typescript
// app/layout.tsx (Server Component)
import { ThemeProvider } from '@/providers/ThemeProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Client Component wrapping Server Components */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Consuming Context (Client Component)
```typescript
// components/ThemeToggle.tsx
'use client'

import { useTheme } from '@/providers/ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  )
}
```

## Third-Party Libraries

### Using Client-Only Libraries
```typescript
// components/Chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis } from 'recharts'

export default function Chart({ data }: { data: any[] }) {
  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  )
}
```

### Wrapping Server-Only Code
```typescript
// lib/server-only-utils.ts
import 'server-only' // This package ensures code only runs on server

export async function getSecretData() {
  const apiKey = process.env.SECRET_API_KEY
  // This code will never be sent to the client
  return fetch(`https://api.example.com/secret`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
}
```
```typescript
// lib/client-only-utils.ts
import 'client-only' // This package ensures code only runs on client

export function trackEvent(event: string) {
  // Browser-only code
  window.gtag?.('event', event)
}
```

## Streaming and Suspense

### Streaming Server Components
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function SlowComponent() {
  // Simulate slow data fetch
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return <div>Slow data loaded!</div>
}

async function FastComponent() {
  return <div>Fast data loaded!</div>
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Fast component renders immediately */}
      <FastComponent />
      
      {/* Slow component streams in when ready */}
      <Suspense fallback={<div>Loading slow data...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

## Common Patterns

### Pattern 1: Form with Client Validation
```typescript
// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { submitForm } from '@/lib/actions'

export default function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    // Client-side validation
    if (!email.includes('@')) {
      setErrors({ email: 'Invalid email' })
      return
    }
    
    // Submit to server
    await submitForm(formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Pattern 2: Hybrid List (Server + Client)
```typescript
// app/products/page.tsx (Server Component)
import ProductCard from '@/components/ProductCard'

export default async function ProductsPage() {
  const products = await fetchProducts() // Server-side fetch
  
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```
```typescript
// components/ProductCard.tsx (Client Component)
'use client'

import { useState } from 'react'

export default function ProductCard({ product }: { product: any }) {
  const [liked, setLiked] = useState(false)
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'} Like
      </button>
    </div>
  )
}
```

### Pattern 3: Modal with Client Interactivity
```typescript
// components/Modal.tsx (Client Component)
'use client'

import { useState, useEffect } from 'react'

export default function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {children}
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
```

## Best Practices

### ✅ DO:

1. **Use Server Components by default**
```typescript
   // ✅ Default - no directive needed
   export default async function Page() {
     const data = await fetchData()
     return <div>{data}</div>
   }
```

2. **Add 'use client' only when necessary**
```typescript
   // ✅ Only for interactive components
   'use client'
   import { useState } from 'react'
```

3. **Keep Client Components small and focused**
```typescript
   // ✅ Small, focused Client Component
   'use client'
   export function LikeButton() {
     const [liked, setLiked] = useState(false)
     return <button onClick={() => setLiked(!liked)}>Like</button>
   }
```

4. **Pass Server Components as children to Client Components**
```typescript
   // ✅ Server Component as children prop
   <ClientWrapper>
     <ServerComponent />
   </ClientWrapper>
```

5. **Use Suspense for streaming**
```typescript
   // ✅ Stream slow components
   <Suspense fallback={<Loading />}>
     <SlowComponent />
   </Suspense>
```

### ❌ DON'T:

1. **Don't make entire pages Client Components unnecessarily**
```typescript
   // ❌ Entire page is Client Component
   'use client'
   export default function Page() {
     return <div>Mostly static content</div>
   }
```

2. **Don't fetch data in Client Components when Server Components can**
```typescript
   // ❌ Client-side data fetching
   'use client'
   useEffect(() => {
     fetch('/api/data').then(...)
   }, [])
   
   // ✅ Server-side data fetching
   const data = await fetch('/api/data')
```

3. **Don't pass Server Component functions as props to Client Components**
```typescript
   // ❌ Cannot pass server functions as props
   <ClientComponent onSubmit={serverFunction} />
   
   // ✅ Use Server Actions instead
   <ClientComponent />
```

4. **Don't import Server-only code in Client Components**
```typescript
   // ❌ Server-only imports in Client Component
   'use client'
   import { db } from '@/lib/database' // Error!
```

## Decision Tree: Server or Client Component?
```
Does component need interactivity?
├─ No → Use Server Component ✅
└─ Yes
    ├─ Does it need event listeners? (onClick, onChange)
    │   └─ Yes → Use Client Component 🔴
    ├─ Does it need state? (useState, useReducer)
    │   └─ Yes → Use Client Component 🔴
    ├─ Does it need effects? (useEffect, useLayoutEffect)
    │   └─ Yes → Use Client Component 🔴
    ├─ Does it need browser APIs? (window, localStorage)
    │   └─ Yes → Use Client Component 🔴
    ├─ Does it use third-party libraries with hooks?
    │   └─ Yes → Use Client Component 🔴
    └─ None of the above
        └─ Use Server Component ✅
```

## Summary

**Server Components (Default):**
- No directive needed
- Render on server only
- Can access databases, filesystems
- Zero client-side JavaScript
- Cannot use hooks or interactivity
- Perfect for static content and data fetching

**Client Components:**
- Require `'use client'` directive
- Render on server + hydrate on client
- Can use hooks, state, effects
- Can handle user interactions
- Add to client bundle size
- Perfect for interactive features

**Golden Rule:** Start with Server Components, add `'use client'` only when you need interactivity or browser APIs.

Master this component model and you'll build fast, efficient Next.js applications with the right balance of server and client rendering.