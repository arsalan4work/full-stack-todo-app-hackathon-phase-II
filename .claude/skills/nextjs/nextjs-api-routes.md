---
name: nextjs-api-routes
description: Create API endpoints (Route Handlers) in Next.js 16 App Router. Use when you need REST API endpoints, webhooks, or backend functionality. Handles GET, POST, PUT, DELETE, PATCH requests with full TypeScript support.
---

# Next.js 16 API Routes (Route Handlers)

## Instructions

Route Handlers allow you to create custom request handlers for API endpoints in the App Router.

### 1. Create a Route Handler

**File Location:** `app/api/[endpoint]/route.ts`
```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
```

**URL:** `GET /api/hello`

### 2. Support Multiple HTTP Methods
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET - List all posts
export async function GET() {
  const posts = await db.select('posts')
  return NextResponse.json(posts)
}

// POST - Create new post
export async function POST(request: NextRequest) {
  const body = await request.json()
  const post = await db.insert('posts', body)
  return NextResponse.json(post, { status: 201 })
}

// PUT - Update post
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const post = await db.update('posts', body)
  return NextResponse.json(post)
}

// DELETE - Delete post
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await db.delete('posts', { id })
  return NextResponse.json({ success: true })
}

// PATCH - Partial update
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const post = await db.update('posts', body)
  return NextResponse.json(post)
}
```

### 3. Handle Request Data

**Query Parameters:**
```typescript
// GET /api/search?q=nextjs&limit=10
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') // "nextjs"
  const limit = searchParams.get('limit') // "10"
  
  const results = await search(query, parseInt(limit || '10'))
  return NextResponse.json(results)
}
```

**Request Body:**
```typescript
// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // body = { name: "John", email: "john@example.com" }
  const user = await db.insert('users', body)
  
  return NextResponse.json(user, { status: 201 })
}
```

**Headers:**
```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const userAgent = request.headers.get('user-agent')
  
  return NextResponse.json({ authHeader, userAgent })
}
```

**Cookies:**
```typescript
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ authenticated: true })
}
```

### 4. Dynamic Route Handlers

**Single Parameter:**
```typescript
// app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await db.findOne('posts', { id: params.id })
  
  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(post)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.delete('posts', { id: params.id })
  return NextResponse.json({ success: true })
}
```

**Multiple Parameters:**
```typescript
// app/api/users/[userId]/posts/[postId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; postId: string } }
) {
  const post = await db.findOne('posts', {
    id: params.postId,
    userId: params.userId,
  })
  
  return NextResponse.json(post)
}
```

### 5. Set Response Headers and Cookies

**Headers:**
```typescript
export async function GET() {
  return NextResponse.json(
    { message: 'Success' },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value',
        'Cache-Control': 'no-store',
      },
    }
  )
}
```

**Cookies:**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await authenticate(body)
  
  const response = NextResponse.json({ success: true })
  
  // Set cookie
  response.cookies.set('auth-token', user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  
  return response
}
```

### 6. Handle Errors
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('API Error:', error)
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 7. Validate Input

**With Zod:**
```typescript
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const validated = userSchema.parse(body)
    
    // Save to database
    const user = await db.insert('users', validated)
    
    return NextResponse.json(user, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 8. Authentication Middleware
```typescript
// lib/auth.ts
export async function validateToken(token: string) {
  // Verify JWT or session token
  const user = await verifyToken(token)
  return user
}
```
```typescript
// app/api/protected/route.ts
import { validateToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    )
  }
  
  try {
    const user = await validateToken(token)
    
    // User is authenticated
    const data = await fetchProtectedData(user.id)
    
    return NextResponse.json(data)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    )
  }
}
```

### 9. CORS Configuration
```typescript
// app/api/public/route.ts
export async function GET(request: NextRequest) {
  const data = await fetchPublicData()
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

### 10. Rate Limiting
```typescript
// lib/rate-limit.ts
const rateLimitMap = new Map<string, number[]>()

export function rateLimit(ip: string, limit: number = 10, window: number = 60000) {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  
  // Remove old timestamps outside window
  const recentTimestamps = timestamps.filter(t => now - t < window)
  
  if (recentTimestamps.length >= limit) {
    return false // Rate limit exceeded
  }
  
  recentTimestamps.push(now)
  rateLimitMap.set(ip, recentTimestamps)
  
  return true // Within rate limit
}
```
```typescript
// app/api/limited/route.ts
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    )
  }
  
  // Process request
  const data = await processRequest()
  return NextResponse.json(data)
}
```

## Examples

### Example 1: Complete CRUD API
```typescript
// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const todoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
})

// GET /api/todos - List all todos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get('completed')
    
    let todos
    if (completed !== null) {
      todos = await db.select('todos', { completed: completed === 'true' })
    } else {
      todos = await db.select('todos')
    }
    
    return NextResponse.json(todos)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

// POST /api/todos - Create new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const validated = todoSchema.parse(body)
    
    // Create
    const todo = await db.insert('todos', {
      ...validated,
      completed: validated.completed || false,
      createdAt: new Date().toISOString(),
    })
    
    return NextResponse.json(todo, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}
```
```typescript
// app/api/todos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: { id: string } }

// GET /api/todos/:id - Get single todo
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const todo = await db.findOne('todos', { id: params.id })
    
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(todo)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 }
    )
  }
}

// PUT /api/todos/:id - Update todo
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const todo = await db.update('todos', { id: params.id }, body)
    
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(todo)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    )
  }
}

// DELETE /api/todos/:id - Delete todo
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await db.delete('todos', { id: params.id })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}

// PATCH /api/todos/:id - Toggle completed
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const todo = await db.findOne('todos', { id: params.id })
    
    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      )
    }
    
    const updated = await db.update(
      'todos',
      { id: params.id },
      { completed: !todo.completed }
    )
    
    return NextResponse.json(updated)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle todo' },
      { status: 500 }
    )
  }
}
```

### Example 2: Authentication API
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate
    const { email, password } = loginSchema.parse(body)
    
    // Find user
    const user = await db.findOne('users', { email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
```
```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear auth cookie
  response.cookies.delete('auth-token')
  
  return response
}
```
```typescript
// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
    }
    
    const user = await db.findOne('users', { id: decoded.userId })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    )
  }
}
```

### Example 3: Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(failedPayment)
      break
      
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCreated(subscription)
      break
      
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
  
  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Update database
  await db.update('orders', 
    { paymentIntentId: paymentIntent.id },
    { status: 'paid' }
  )
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Update database
  await db.update('orders',
    { paymentIntentId: paymentIntent.id },
    { status: 'failed' }
  )
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Create subscription record
  await db.insert('subscriptions', {
    userId: subscription.metadata.userId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
  })
}
```

### Example 4: File Upload API
```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only images are allowed' },
        { status: 400 }
      )
    }
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      )
    }
    
    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(process.cwd(), 'public/uploads', filename)
    
    // Save file
    await writeFile(filepath, buffer)
    
    // Return file URL
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      filename,
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### Example 5: Proxy API
```typescript
// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter required' },
      { status: 400 }
    )
  }
  
  try {
    // Fetch from external API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}`,
      },
    })
    
    const data = await response.json()
    
    // Return with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    )
  }
}
```

### Example 6: Search API with Debouncing
```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    )
  }
  
  try {
    // Search in database
    const results = await db.search('posts', query, limit)
    
    return NextResponse.json({
      query,
      count: results.length,
      results,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

## Best Practices

### ✅ DO:

1. **Use appropriate HTTP methods**
   - GET for reading
   - POST for creating
   - PUT for full updates
   - PATCH for partial updates
   - DELETE for removing

2. **Return proper status codes**
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error

3. **Validate all inputs**
```typescript
   const validated = schema.parse(body)
```

4. **Handle errors gracefully**
```typescript
   try {
     // API logic
   } catch (error) {
     return NextResponse.json({ error: 'Message' }, { status: 500 })
   }
```

5. **Use TypeScript for type safety**
```typescript
   type Params = { params: { id: string } }
```

### ❌ DON'T:

1. **Don't expose sensitive data**
```typescript
   // ❌ Bad
   return NextResponse.json({ password: user.password })
   
   // ✅ Good
   return NextResponse.json({ id: user.id, name: user.name })
```

2. **Don't skip authentication**
```typescript
   // ✅ Always check auth for protected routes
   const token = request.headers.get('authorization')
   if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

3. **Don't forget rate limiting**
```typescript
   // ✅ Implement rate limiting for public APIs
   if (!rateLimit(ip)) {
     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
   }
```

---

## Summary

Route Handlers provide:
- 🛣️ **REST API endpoints** - Full HTTP method support
- 🔒 **Secure** - Server-side execution
- 📝 **TypeScript** - Type-safe by default
- 🎯 **Dynamic routes** - Parameterized endpoints
- 🍪 **Cookies & Headers** - Full control
- ✅ **Validation** - Built-in with Zod
- 🔐 **Authentication** - Easy to implement
- ⚡ **Fast** - Optimized performance

Use Route Handlers for all API endpoints, webhooks, and backend functionality in your Next.js 16 applications.