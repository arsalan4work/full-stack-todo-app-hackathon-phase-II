----
name: nextjs-data-fetching-skill
description: Next.js 16 extends the native `fetch` API with automatic caching, revalidation, and deduplication. Data fetching happens primarily in Server Components, with the framework handling optimization automatically.
----

### Key Benefits
- 🚀 **Automatic Caching** - Responses cached by default
- 🔄 **Smart Revalidation** - Time-based or on-demand refresh
- 📊 **Request Deduplication** - Same request only fetched once
- ⚡ **Parallel Fetching** - Multiple requests in parallel
- 🎯 **Streaming** - Progressive rendering with Suspense
- 🔒 **Server-Side** - Secure data access with credentials

## Basic Data Fetching

### Simple Fetch in Server Component
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const res = await fetch('https://api.example.com/posts')
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  const posts = await res.json()
  
  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </div>
  )
}
```

### Fetch with Error Handling
```typescript
// app/users/page.tsx
async function fetchUsers() {
  try {
    const res = await fetch('https://api.example.com/users')
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch users:', error)
    throw error // Re-throw to trigger error boundary
  }
}

export default async function UsersPage() {
  const users = await fetchUsers()
  
  return (
    <div>
      {users.map((user: any) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

## Caching Strategies

### Default Caching Behavior

By default, Next.js caches fetch requests indefinitely:
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Cached indefinitely by default
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()
  
  return <div>{/* Render posts */}</div>
}
```

### No Caching (Always Fresh)
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Never cache - always fetch fresh data
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  })
  const posts = await res.json()
  
  return <div>{/* Render posts */}</div>
}
```

**Use Cases:**
- Real-time data (stock prices, live scores)
- User-specific data
- Frequently changing content

### Time-Based Revalidation
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Cache for 60 seconds, then revalidate
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  })
  const posts = await res.json()
  
  return <div>{/* Render posts */}</div>
}
```

**Revalidation Values:**
- `0` - No caching (same as `cache: 'no-store'`)
- `60` - Cache for 60 seconds
- `3600` - Cache for 1 hour
- `86400` - Cache for 24 hours

### Tag-Based Revalidation
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  // Cache with tag for targeted revalidation
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  })
  const posts = await res.json()
  
  return <div>{/* Render posts */}</div>
}
```

Revalidate from Server Action:
```typescript
// app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  
  await db.insert('posts', { title })
  
  // Revalidate all fetches tagged with 'posts'
  revalidateTag('posts')
  
  return { success: true }
}
```

## Parallel Data Fetching

### Sequential Fetching (Slow)
```typescript
// ❌ Sequential - each waits for previous
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json())
  const posts = await fetch(`/api/users/${params.id}/posts`).then(r => r.json())
  const comments = await fetch(`/api/users/${params.id}/comments`).then(r => r.json())
  
  // Total time: user + posts + comments
  return <div>{/* Render */}</div>
}
```

### Parallel Fetching (Fast)
```typescript
// ✅ Parallel - all fetch simultaneously
export default async function UserPage({ params }: { params: { id: string } }) {
  const [user, posts, comments] = await Promise.all([
    fetch(`/api/users/${params.id}`).then(r => r.json()),
    fetch(`/api/users/${params.id}/posts`).then(r => r.json()),
    fetch(`/api/users/${params.id}/comments`).then(r => r.json()),
  ])
  
  // Total time: max(user, posts, comments)
  return <div>{/* Render */}</div>
}
```

### Parallel with Individual Error Handling
```typescript
export default async function DashboardPage() {
  const [userResult, statsResult, activityResult] = await Promise.allSettled([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/stats').then(r => r.json()),
    fetch('/api/activity').then(r => r.json()),
  ])
  
  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null
  const activity = activityResult.status === 'fulfilled' ? activityResult.value : null
  
  return (
    <div>
      {user && <UserProfile user={user} />}
      {stats && <Stats data={stats} />}
      {activity ? <Activity data={activity} /> : <p>Activity unavailable</p>}
    </div>
  )
}
```

## Streaming with Suspense

### Basic Streaming
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function UserInfo() {
  const user = await fetch('/api/user').then(r => r.json())
  return <div>{user.name}</div>
}

async function Stats() {
  // Simulate slow fetch
  await new Promise(resolve => setTimeout(resolve, 3000))
  const stats = await fetch('/api/stats').then(r => r.json())
  return <div>{stats.count} items</div>
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Renders immediately */}
      <Suspense fallback={<div>Loading user...</div>}>
        <UserInfo />
      </Suspense>
      
      {/* Streams in when ready */}
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
    </div>
  )
}
```

### Multiple Suspense Boundaries
```typescript
// app/posts/page.tsx
import { Suspense } from 'react'

async function PopularPosts() {
  const posts = await fetch('/api/posts/popular').then(r => r.json())
  return <div>{/* Render popular posts */}</div>
}

async function RecentPosts() {
  const posts = await fetch('/api/posts/recent').then(r => r.json())
  return <div>{/* Render recent posts */}</div>
}

async function TrendingPosts() {
  const posts = await fetch('/api/posts/trending').then(r => r.json())
  return <div>{/* Render trending posts */}</div>
}

export default function PostsPage() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Suspense fallback={<Skeleton />}>
        <PopularPosts />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <RecentPosts />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <TrendingPosts />
      </Suspense>
    </div>
  )
}
```

### Nested Suspense
```typescript
// app/profile/page.tsx
import { Suspense } from 'react'

async function UserHeader({ userId }: { userId: string }) {
  const user = await fetch(`/api/users/${userId}`).then(r => r.json())
  return <header>{user.name}</header>
}

async function UserPosts({ userId }: { userId: string }) {
  const posts = await fetch(`/api/users/${userId}/posts`).then(r => r.json())
  return <div>{/* Render posts */}</div>
}

async function UserComments({ userId }: { userId: string }) {
  const comments = await fetch(`/api/users/${userId}/comments`).then(r => r.json())
  return <div>{/* Render comments */}</div>
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return (
    <div>
      {/* Header loads first */}
      <Suspense fallback={<div>Loading user...</div>}>
        <UserHeader userId={params.userId} />
      </Suspense>
      
      {/* Content loads after header */}
      <Suspense fallback={<div>Loading content...</div>}>
        <div className="grid grid-cols-2">
          <Suspense fallback={<div>Loading posts...</div>}>
            <UserPosts userId={params.userId} />
          </Suspense>
          
          <Suspense fallback={<div>Loading comments...</div>}>
            <UserComments userId={params.userId} />
          </Suspense>
        </div>
      </Suspense>
    </div>
  )
}
```

## Request Deduplication

Next.js automatically deduplicates identical fetch requests during a single render:
```typescript
// app/posts/[id]/page.tsx
async function PostContent({ id }: { id: string }) {
  // First fetch
  const post = await fetch(`/api/posts/${id}`).then(r => r.json())
  return <article>{post.content}</article>
}

async function PostAuthor({ id }: { id: string }) {
  // Same fetch - automatically deduplicated
  const post = await fetch(`/api/posts/${id}`).then(r => r.json())
  return <div>By: {post.author}</div>
}

async function PostStats({ id }: { id: string }) {
  // Same fetch - automatically deduplicated
  const post = await fetch(`/api/posts/${id}`).then(r => r.json())
  return <div>Views: {post.views}</div>
}

export default function PostPage({ params }: { params: { id: string } }) {
  // Only ONE actual fetch happens, shared across all components
  return (
    <div>
      <PostContent id={params.id} />
      <PostAuthor id={params.id} />
      <PostStats id={params.id} />
    </div>
  )
}
```

## Database Queries

### Direct Database Access in Server Components
```typescript
// app/posts/page.tsx
import { db } from '@/lib/database'

export default async function PostsPage() {
  // Direct database query
  const posts = await db.query('SELECT * FROM posts ORDER BY created_at DESC')
  
  return (
    <div>
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

### Using ORM (Prisma, Drizzle)
```typescript
// app/users/page.tsx
import { prisma } from '@/lib/prisma'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>{user.posts.length} posts</p>
        </div>
      ))}
    </div>
  )
}
```

### Cached Database Queries
```typescript
// lib/data.ts
import { unstable_cache } from 'next/cache'
import { db } from './database'

export const getCachedPosts = unstable_cache(
  async () => {
    return await db.query('SELECT * FROM posts')
  },
  ['posts'], // Cache key
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['posts'], // Tag for manual revalidation
  }
)
```
```typescript
// app/posts/page.tsx
import { getCachedPosts } from '@/lib/data'

export default async function PostsPage() {
  const posts = await getCachedPosts()
  
  return <div>{/* Render posts */}</div>
}
```

## External APIs

### REST API with Headers
```typescript
// lib/api.ts
const API_BASE = process.env.API_BASE_URL

export async function fetchPosts() {
  const res = await fetch(`${API_BASE}/posts`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  return res.json()
}

export async function fetchPost(id: string) {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    next: { revalidate: 300 },
  })
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Post not found')
    }
    throw new Error('Failed to fetch post')
  }
  
  return res.json()
}
```

### GraphQL Queries
```typescript
// lib/graphql.ts
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT

export async function fetchGraphQL(query: string, variables?: any) {
  const res = await fetch(GRAPHQL_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GRAPHQL_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 60 },
  })
  
  const json = await res.json()
  
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  
  return json.data
}
```
```typescript
// app/posts/page.tsx
import { fetchGraphQL } from '@/lib/graphql'

const POSTS_QUERY = `
  query GetPosts {
    posts {
      id
      title
      content
      author {
        name
      }
    }
  }
`

export default async function PostsPage() {
  const data = await fetchGraphQL(POSTS_QUERY)
  
  return (
    <div>
      {data.posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>By: {post.author.name}</p>
        </article>
      ))}
    </div>
  )
}
```

### Third-Party APIs with SDK
```typescript
// lib/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function getProducts() {
  const products = await stripe.products.list({
    limit: 100,
  })
  
  return products.data
}
```
```typescript
// app/products/page.tsx
import { getProducts } from '@/lib/stripe'

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  )
}
```

## Dynamic Routes Data Fetching

### Basic Dynamic Route
```typescript
// app/posts/[slug]/page.tsx
async function fetchPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 },
  })
  
  if (!res.ok) {
    throw new Error('Post not found')
  }
  
  return res.json()
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await fetchPost(params.slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### Generate Static Params

Pre-render dynamic routes at build time:
```typescript
// app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  
  return posts.map((post: any) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(r => r.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
    </article>
  )
}
```

**Build Output:**
- `/posts/hello-world` - Pre-rendered
- `/posts/nextjs-guide` - Pre-rendered
- `/posts/react-tips` - Pre-rendered

## Loading States

### Route-Level Loading
```typescript
// app/posts/loading.tsx
export default function PostsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-32 bg-gray-200 rounded mb-4" />
      <div className="h-32 bg-gray-200 rounded mb-4" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  )
}
```

Automatically shows while `page.tsx` is loading.

### Component-Level Loading
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

function LoadingSkeleton() {
  return <div className="animate-pulse bg-gray-200 h-32 rounded" />
}

async function Stats() {
  const stats = await fetch('/api/stats').then(r => r.json())
  return <div>{stats.count}</div>
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <Stats />
      </Suspense>
    </div>
  )
}
```

## Error Handling

### Route-Level Error Boundary
```typescript
// app/posts/error.tsx
'use client'

export default function PostsError({
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

### Custom Not Found
```typescript
// app/posts/[id]/not-found.tsx
export default function PostNotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>The post you're looking for doesn't exist.</p>
    </div>
  )
}
```
```typescript
// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const res = await fetch(`/api/posts/${params.id}`)
  
  if (res.status === 404) {
    notFound() // Shows not-found.tsx
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch post') // Shows error.tsx
  }
  
  const post = await res.json()
  
  return <article>{post.title}</article>
}
```

## Pagination

### Cursor-Based Pagination
```typescript
// app/posts/page.tsx
async function fetchPosts(cursor?: string) {
  const url = cursor 
    ? `https://api.example.com/posts?cursor=${cursor}`
    : 'https://api.example.com/posts'
  
  const res = await fetch(url, { next: { revalidate: 60 } })
  return res.json()
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { cursor?: string }
}) {
  const data = await fetchPosts(searchParams.cursor)
  
  return (
    <div>
      {data.posts.map((post: any) => (
        <article key={post.id}>{post.title}</article>
      ))}
      
      {data.nextCursor && (
        <a href={`/posts?cursor=${data.nextCursor}`}>
          Next Page
        </a>
      )}
    </div>
  )
}
```

### Page-Based Pagination
```typescript
// app/posts/page.tsx
async function fetchPosts(page: number) {
  const res = await fetch(
    `https://api.example.com/posts?page=${page}&limit=10`,
    { next: { revalidate: 60 } }
  )
  return res.json()
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const data = await fetchPosts(page)
  
  return (
    <div>
      {data.posts.map((post: any) => (
        <article key={post.id}>{post.title}</article>
      ))}
      
      <nav>
        {page > 1 && <a href={`/posts?page=${page - 1}`}>Previous</a>}
        <span>Page {page} of {data.totalPages}</span>
        {page < data.totalPages && <a href={`/posts?page=${page + 1}`}>Next</a>}
      </nav>
    </div>
  )
}
```

## Search and Filtering

### Server-Side Search
```typescript
// app/search/page.tsx
async function searchPosts(query: string) {
  const res = await fetch(
    `https://api.example.com/posts/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' } // Don't cache search results
  )
  return res.json()
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  
  if (!query) {
    return (
      <div>
        <h1>Search Posts</h1>
        <form action="/search">
          <input name="q" placeholder="Search..." required />
          <button type="submit">Search</button>
        </form>
      </div>
    )
  }
  
  const results = await searchPosts(query)
  
  return (
    <div>
      <h1>Results for "{query}"</h1>
      <p>Found {results.length} posts</p>
      
      {results.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Filtering with Multiple Params
```typescript
// app/products/page.tsx
async function fetchProducts(filters: {
  category?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}) {
  const params = new URLSearchParams()
  
  if (filters.category) params.append('category', filters.category)
  if (filters.minPrice) params.append('min_price', filters.minPrice)
  if (filters.maxPrice) params.append('max_price', filters.maxPrice)
  if (filters.sort) params.append('sort', filters.sort)
  
  const res = await fetch(
    `https://api.example.com/products?${params.toString()}`,
    { next: { revalidate: 300 } }
  )
  
  return res.json()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }
}) {
  const products = await fetchProducts(searchParams)
  
  return (
    <div>
      <aside>
        <form action="/products">
          <select name="category">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
          
          <input name="minPrice" type="number" placeholder="Min Price" />
          <input name="maxPrice" type="number" placeholder="Max Price" />
          
          <select name="sort">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          
          <button type="submit">Apply Filters</button>
        </form>
      </aside>
      
      <main>
        {products.map((product: any) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </main>
    </div>
  )
}
```

## Revalidation Strategies

### On-Demand Revalidation
```typescript
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  
  await db.insert('posts', { title })
  
  // Revalidate specific path
  revalidatePath('/posts')
  
  // Or revalidate by tag
  revalidateTag('posts')
  
  return { success: true }
}
```

### Webhook Revalidation
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  
  // Verify secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
  
  const body = await request.json()
  
  // Revalidate based on webhook data
  if (body.path) {
    revalidatePath(body.path)
  }
  
  if (body.tag) {
    revalidateTag(body.tag)
  }
  
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

**Usage:**
```bash
curl -X POST "https://yoursite.com/api/revalidate?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"path": "/posts"}'
```

## Best Practices

### ✅ DO:

1. **Fetch data in Server Components**
```typescript
   // ✅ Server Component data fetching
   export default async function Page() {
     const data = await fetch('/api/data')
   }
```

2. **Use parallel fetching**
```typescript
   // ✅ Parallel requests
   const [users, posts] = await Promise.all([
     fetch('/api/users'),
     fetch('/api/posts'),
   ])
```

3. **Add appropriate caching**
```typescript
   // ✅ Cache for 1 hour
   fetch('/api/data', { next: { revalidate: 3600 } })
```

4. **Use Suspense for streaming**
```typescript
   // ✅ Stream slow components
   <Suspense fallback={<Loading />}>
     <SlowComponent />
   </Suspense>
```

5. **Handle errors gracefully**
```typescript
   // ✅ Proper error handling
   try {
     const data = await fetch('/api/data')
     if (!data.ok) throw new Error()
   } catch (error) {
     // Handle error
   }
```

### ❌ DON'T:

1. **Don't fetch in Client Components unnecessarily**
```typescript
   // ❌ Client Component fetching
   'use client'
   useEffect(() => { fetch(...) }, [])
   
   // ✅ Server Component fetching
   const data = await fetch(...)
```

2. **Don't use sequential fetching**
```typescript
   // ❌ Sequential (slow)
   const users = await fetch('/api/users')
   const posts = await fetch('/api/posts')
   
   // ✅ Parallel (fast)
   const [users, posts] = await Promise.all([...])
```

3. **Don't forget to handle loading states**
```typescript
   // ❌ No loading UI
   async function Component() {
     const data = await fetch(...)
   }
   
   // ✅ With Suspense
   <Suspense fallback

   ={<Loading />}>
    <Component />
    </Suspense>

4. **Don't cache user-specific data**
```typescript
   // ❌ Caching user data
   fetch('/api/user-profile', { next: { revalidate: 60 } })
   
   // ✅ No cache for user data
   fetch('/api/user-profile', { cache: 'no-store' })
```

## Summary

Next.js 16 data fetching provides:
- 🚀 **Automatic caching** - Smart default caching
- 🔄 **Flexible revalidation** - Time-based or on-demand
- 📊 **Request deduplication** - Automatic optimization
- ⚡ **Parallel fetching** - Faster page loads
- 🎯 **Streaming with Suspense** - Progressive rendering
- 🔒 **Server-side security** - Safe credential handling
- 📝 **Simple API** - Extended native fetch
- 🎨 **Loading states** - Built-in UI patterns

Master these patterns to build fast, efficient Next.js applications with optimal data fetching strategies.