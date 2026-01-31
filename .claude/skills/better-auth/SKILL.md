---
name: better-auth
description: Implement comprehensive authentication in TypeScript/Next.js applications with Better Auth. Use for email/password, social sign-on, 2FA, passkeys, session management, and authorization. Framework-agnostic with built-in database management.
---

# Better Auth

## Instructions

Better Auth is a framework-agnostic authentication and authorization framework for TypeScript that provides comprehensive features out of the box with a plugin ecosystem.

### 1. What is Better Auth?

Better Auth provides:
- **Framework-agnostic** - Works with Next.js, React, Vue, Svelte
- **Email & Password** - Built-in secure authentication
- **Social Sign-on** - Multiple OAuth providers
- **2FA & Passkeys** - Advanced security features
- **Session Management** - Built-in session handling
- **Plugin Ecosystem** - Easy extensibility
- **Auto Database Management** - Automatic migrations
- **Rate Limiting** - Built-in protection

**Key Features:**
- Organization & access control
- Multi-tenant support
- Multi-session support
- Username/magic link/email OTP plugins
- Enterprise SSO capabilities

### 2. Installation
```bash
# Install Better Auth
npm install better-auth

# Using other package managers
pnpm add better-auth
yarn add better-auth
bun add better-auth
```

**For separate client/server:**
Install Better Auth in both frontend and backend projects.

### 3. Environment Variables
```bash
# .env
# Required: Secret key for encryption (min 32 characters)
BETTER_AUTH_SECRET=your-secret-key-here

# Generate with: openssl rand -base64 32

# Base URL (recommended)
BETTER_AUTH_URL=http://localhost:3000

# Database URL
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Social Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate Secret Key:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or use Better Auth CLI
npx @better-auth/cli generate-secret
```

### 4. Server Setup (Next.js App Router)
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    provider: "pg", // or "mysql", "sqlite"
    url: process.env.DATABASE_URL!
  },
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  }
})
```

**API Route Handler:**
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"

export const { GET, POST } = auth.handler
```

### 5. Database Migration
```bash
# Generate database schema
npx @better-auth/cli generate

# Or migrate directly (Kysely adapter)
npx @better-auth/cli migrate
```

**Manual Migration:**
Better Auth will automatically create these tables:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

### 6. Client Setup (React/Next.js)
```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
})

export const { signIn, signUp, signOut, useSession } = authClient
```

### 7. Authentication Methods

**Email & Password Sign Up:**
```typescript
// components/SignUpForm.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useState } from "react"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await authClient.signUp.email({
      email,
      password,
      name
    }, {
      onSuccess: (ctx) => {
        console.log("User signed up:", ctx.data)
        // Redirect to dashboard
      },
      onError: (ctx) => {
        console.error("Sign up error:", ctx.error)
      }
    })
  }

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

**Email & Password Sign In:**
```typescript
// components/SignInForm.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function SignInForm() {
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    await authClient.signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string
    }, {
      onSuccess: () => {
        router.push("/dashboard")
      },
      onError: (ctx) => {
        alert(ctx.error.message)
      }
    })
  }

  return (
    <form onSubmit={handleSignIn}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

**Social Sign-In:**
```typescript
// components/SocialAuth.tsx
"use client"

import { authClient } from "@/lib/auth-client"

export function SocialAuth() {
  const handleGitHubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard"
    })
  }

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard"
    })
  }

  return (
    <div>
      <button onClick={handleGitHubSignIn}>
        Continue with GitHub
      </button>
      <button onClick={handleGoogleSignIn}>
        Continue with Google
      </button>
    </div>
  )
}
```

### 8. Session Management

**Client-Side Session Hook:**
```typescript
// components/UserProfile.tsx
"use client"

import { useSession } from "@/lib/auth-client"

export function UserProfile() {
  const { data: session, isPending, error } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error || !session) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
    </div>
  )
}
```

**Server-Side Session:**
```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: headers()
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
    </div>
  )
}
```

### 9. Sign Out
```typescript
// components/SignOutButton.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        }
      }
    })
  }

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  )
}
```

### 10. Plugins (Two-Factor Authentication)
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { twoFactor } from "better-auth/plugins"

export const auth = betterAuth({
  database: {
    provider: "pg",
    url: process.env.DATABASE_URL!
  },
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    twoFactor({
      issuer: "My App"
    })
  ]
})
```

**After adding plugin, migrate:**
```bash
npx @better-auth/cli migrate
```

**Client-side 2FA:**
```typescript
// components/TwoFactorSetup.tsx
"use client"

import { authClient } from "@/lib/auth-client"

export function TwoFactorSetup() {
  const enable2FA = async () => {
    const { data } = await authClient.twoFactor.enable({
      password: "user-password"
    })
    
    // data contains QR code and backup codes
    console.log("QR Code:", data.qrCode)
    console.log("Backup codes:", data.backupCodes)
  }

  return (
    <button onClick={enable2FA}>
      Enable 2FA
    </button>
  )
}
```

## Examples

### Example 1: Complete Authentication Setup (Next.js)
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  appName: "Todo App",
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  
  database: {
    provider: "pg",
    url: process.env.DATABASE_URL!
  },
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8
  },
  
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  
  advanced: {
    generateId: () => {
      // Custom ID generation
      return crypto.randomUUID()
    }
  }
})
```
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"

export const { GET, POST } = auth.handler
```
```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!
})
```

### Example 2: Protected Route Pattern
```typescript
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/sign-in") || 
      request.nextUrl.pathname.startsWith("/sign-up")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"]
}
```

### Example 3: User Profile Update
```typescript
// components/UpdateProfile.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useState } from "react"

export function UpdateProfile() {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState(session?.user.name || "")
  const [image, setImage] = useState(session?.user.image || "")

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await authClient.updateUser({
      name,
      image
    }, {
      onSuccess: () => {
        alert("Profile updated!")
      }
    })
  }

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="url"
        placeholder="Profile Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <button type="submit">Update Profile</button>
    </form>
  )
}
```

### Example 4: Password Reset Flow
```typescript
// components/ForgotPassword.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useState } from "react"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await authClient.forgetPassword({
      email,
      redirectTo: "/reset-password"
    }, {
      onSuccess: () => {
        setSent(true)
      }
    })
  }

  if (sent) {
    return <p>Reset link sent to {email}</p>
  }

  return (
    <form onSubmit={handleReset}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  )
}
```
```typescript
// app/reset-password/page.tsx
"use client"

import { authClient } from "@/lib/auth-client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [newPassword, setNewPassword] = useState("")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await authClient.resetPassword({
      token: token!,
      newPassword
    }, {
      onSuccess: () => {
        router.push("/sign-in")
      }
    })
  }

  return (
    <form onSubmit={handleReset}>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  )
}
```

### Example 5: Organization Plugin
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  // ... other config
  plugins: [
    organization({
      roles: ["owner", "admin", "member"],
      permissions: {
        owner: ["*"],
        admin: ["todo:create", "todo:update", "todo:delete", "todo:read"],
        member: ["todo:read"]
      }
    })
  ]
})
```
```typescript
// components/CreateOrganization.tsx
"use client"

import { authClient } from "@/lib/auth-client"

export function CreateOrganization() {
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.target as HTMLFormElement)
    
    await authClient.organization.create({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string
    }, {
      onSuccess: (ctx) => {
        console.log("Organization created:", ctx.data)
      }
    })
  }

  return (
    <form onSubmit={handleCreate}>
      <input name="name" placeholder="Organization Name" required />
      <input name="slug" placeholder="organization-slug" required />
      <button type="submit">Create Organization</button>
    </form>
  )
}
```

### Example 6: Server-Side Authorization
```typescript
// app/api/todos/route.ts
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check organization membership
  const organizations = await auth.api.listOrganizations({
    userId: session.user.id
  })

  // Fetch todos for user's organizations
  const todos = await fetchTodos(organizations)

  return NextResponse.json(todos)
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check permissions
  const hasPermission = await auth.api.hasPermission({
    userId: session.user.id,
    organizationId: request.body.organizationId,
    permission: "todo:create"
  })

  if (!hasPermission) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  // Create todo
  const todo = await createTodo(request.body)

  return NextResponse.json(todo, { status: 201 })
}
```

## Best Practices

### ✅ DO:

1. **Always set BETTER_AUTH_SECRET in production**
```bash
   # Generate secure secret
   openssl rand -base64 32
```

2. **Use environment variables for configuration**
```typescript
   baseURL: process.env.BETTER_AUTH_URL!,
   secret: process.env.BETTER_AUTH_SECRET!
```

3. **Enable email verification for production**
```typescript
   emailAndPassword: {
     enabled: true,
     requireEmailVerification: true
   }
```

4. **Use middleware for route protection**
```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     // Check session
   }
```

5. **Migrate database after adding plugins**
```bash
   npx @better-auth/cli migrate
```

6. **Handle errors gracefully**
```typescript
   await authClient.signIn.email(data, {
     onError: (ctx) => {
       console.error(ctx.error)
     }
   })
```

### ❌ DON'T:

1. **Don't hardcode secrets**
```typescript
   // ❌ Bad
   secret: "my-secret-key"
   
   // ✅ Good
   secret: process.env.BETTER_AUTH_SECRET!
```

2. **Don't skip database migrations**
```bash
   # ✅ Always run after config changes
   npx @better-auth/cli migrate
```

3. **Don't expose session data unnecessarily**
```typescript
   // ❌ Bad
   return { session: fullSession }
   
   // ✅ Good
   return { user: { id, name, email } }
```

4. **Don't skip error handling**
```typescript
   // ✅ Always handle errors
   onError: (ctx) => {
     handleError(ctx.error)
   }
```

5. **Don't use weak passwords in production**
```typescript
   // ✅ Set minimum password length
   emailAndPassword: {
     minPasswordLength: 12
   }
```

---

## Summary

Better Auth provides:
- 🚀 **Framework-agnostic** - Works everywhere
- 🔐 **Comprehensive** - Email, social, 2FA, passkeys
- 🎯 **Type-safe** - Full TypeScript support
- 📦 **Plugin ecosystem** - Easy extensibility
- 🗄️ **Auto database** - Automatic migrations
- 🔒 **Secure** - Built-in rate limiting
- 👥 **Organizations** - Multi-tenant support
- ⚡ **Modern** - React hooks, server components

Use Better Auth for complete, production-ready authentication in your TypeScript applications.